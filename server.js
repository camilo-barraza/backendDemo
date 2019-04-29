// --------------- forest admin config ----------------------
'use strict';
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('express-cors');
const jwt = require('express-jwt');

// --------------- prisma config ----------------------

// https://github.com/prisma/prisma-examples/tree/master/node
// https://github.com/prisma/graphql-yoga/tree/master/examples
const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const { importSchema } = require('graphql-import')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const { hash, compare } = require('bcrypt')
const { sign } = require('jsonwebtoken')
var test = require('./REST/v1/test');
const { introspectSchema, makeRemoteExecutableSchema,
  makeExecutableSchema, mergeSchemas } = require('graphql-tools')
const { APP_SECRET, getUser , getPrismaServerToken } = require('./utils')
const permissions = require('./config/permissions')

// TODO Code refactor for resolvers on separate files

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
  Mutation:{
    login: async (parent, { username, password , role }, context) => {
      const query = `
        query  {
          users(where: { username: "${username}" }) {
            id
            isAdmin
            isStore
            isTeam
            isAccount
            isAgent
            isClient
            password
            instance{
              id
            }
          }
        }`
      const user = (await prisma.$graphql(query)).users[0]

      if (!user) {
        throw new Error(`No user found for username: ${username}`)
      }
      const passwordValid = await compare(password, user.password)
      if (!passwordValid) {
        throw new Error('Invalid password')
      }
      if(user[`is${role}`]){
        //TODO set app secret and expiration on env variable

        return {
          token: sign({ id: user.id , role, instance:user.instance.id }, APP_SECRET , {expiresIn:'2d'})
        }
      }
      throw new Error('Invalid role')
    },
    switchRole: async (parent, { username, password , role }, context ) => {
      let user = await context.prisma.user({id:context.user.id})
      
      // TODO set app secret and expiration on env variable

      if(user[`is${role}`]){
        return {
          token: sign({ id: user.id , role, instance:user.instance.id }, APP_SECRET , {expiresIn:'2d'})
        }
      }
      throw new Error('Invalid role')
    }
  }
}

// Send new token on Authorization header for future requests
// TODO refactor code move to separate file
const refreshJwt = async (resolve, root, args, context, info) => {
  // console.log('test');
  const result = await resolve(root, args, context, info)
  if(!root && context.user) {
    // TODO set app secret and expiration on env variable
    let { id,role,instance } = context.user
    token = sign( { id,role,instance }, APP_SECRET , {expiresIn:'2d'})
    context.response.setHeader("Authorization", token)
  }
  return result
}



const main = async () => {
  const link = new HttpLink({ uri: 'http://localhost:4466', fetch  , headers:{
    "Authorization": `Bearer ${getPrismaServerToken()}`
  } })
  
  // https://www.apollographql.com/docs/graphql-tools/remote-schemas
  const schema = await introspectSchema(link);
  const prismaSchema = makeRemoteExecutableSchema({
    schema,
    link,
  });

  let executableSchema = makeExecutableSchema({
    typeDefs: importSchema(path.join(__dirname, './schema.graphql')),
    resolvers
  })

  // TODO code refactor for resolvers on separate files 
  
  // https://www.apollographql.com/docs/graphql-tools/schema-stitching
  const server = new GraphQLServer({
    schema: mergeSchemas({
      schemas: [
        prismaSchema,
        executableSchema,
      ],
      overwrite resolvers
      resolvers:{
        Mutation:{
          _createUser: async (p, args, { prisma: db, request: req }) => {
            if (args.data.password)
              args.data.password = await hash(args.data.password, 10);
            return await prisma.createUser(args.data);
          },
          get createUser() {
            return this._createUser;
          },
          set createUser(value) {
            this._createUser = value;
          },
          updateUser: async (p,args,{prisma:db,request:req}) => {
            if(args.data.password)
              args.data.password = await hash(args.data.password, 10)
            return await prisma.updateUser(args)
          } 
        }
      }
    }),
    // https://github.com/prisma/graphql-yoga/blob/master/examples/middleware/index.js
    // https://github.com/prisma/graphql-middleware
    // some middleware is expect to be called multiple times according to graphql operation, fields and results
    // https://github.com/prisma/graphql-middleware/issues/22
    middlewares: [permissions,refreshJwt],
    context: req => ({
      ...req,
      user: getUser(req),
      prisma
    })
  })
  const options = {
    port: process.env.PORT,
    cors:{
      "origin": "*",
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      "preflightContinue": false,
      "optionsSuccessStatus": 204,
      credentials:true,
      origin:true
    }
  }

  server.start(options, ({ port }) =>
    console.log(
      `Server started, listening on port ${port} for incoming requests.`,
    ),
  )

  const app = server.express;

  // --------------- forest admin config  ----------------------

  app.use(jwt({
    secret: process.env.FOREST_AUTH_SECRET,
    credentialsRequired: false
  }));

  fs.readdirSync('./admin_panel/decorators/routes').forEach((file) => {
    if (file[0] !== '.') {
      app.use('/forest', require(`./admin_panel/decorators/routes/${file}`));
    }
  });

  fs.readdirSync('./admin_panel/routes').forEach((file) => {
    if (file !== '.gitkeep') {
      app.use('/forest', require('./admin_panel/routes/' + file));
    }
  });

  app.use(require('forest-express-sequelize').init({
    modelsDir: __dirname + '/admin_panel/models',
    envSecret: process.env.FOREST_ENV_SECRET,
    authSecret: process.env.FOREST_AUTH_SECRET,
    sequelize: require('./admin_panel/models').sequelize
  }));


  // --------------- REST API CONFIG  ----------------------
  
  // Use REST for getting page counts in case of pagination failure with graphql
  // use REST for file uploads
  app.use('/v1/test', test);
  
  // error handler
  app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500).json({err:err.toString()});
  });



}

main()
