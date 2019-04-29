const { rule } = require('graphql-shield')

module.exports = {
  isAuthenticated: rule()(async (parent, args, context, info) => {
    return context.user !== null
  }),
  isAdmin: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Admin'
  }),
  isAgent: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Agent'
  }),
  isAccount: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Account'
  }),
  isClient: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Client'
  }),
  isTeam: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Team'
  }),
  isStore: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Store'
  }),
  isData: rule()(async (parent, args, context, info) => {
    return context.user.role === 'Data'
  }),
  // for update
  // missing some tests
  isOwner: rule()(async (parent, args, context, info) => {
    let model ;
    if(info.fieldName.startsWith('update')){
      model = info.fieldName.split("update")[1]
      model = model.charAt(0).toLowerCase() + model.slice(1)
    }
    const query = `
    query  {
      ${model}(where: { id: "${args.where.id}" }) {
        author{
          id
        }
      }
    }`
    let res = await context.prisma.$graphql(query) 
    if(!res[model])
        return false 
    if(res[model].author.id === context.user.id)
      return true 
    return false
  }),
  // update in element in same instance
  // untested
  inInstance: rule()(async (parent, args, context, info) => {
    let model ;
    if(info.fieldName.startsWith('update')){
      model = info.fieldName.split("update")[1]
      model = model.charAt(0).toLowerCase() + model.slice(1)
    }
    const query = `
    query  {
      ${model}(where: {id:"${args.where.id}"  , instance:{ id: "${context.user.instance}" } }) {
       id
      }
    }`
    let res = await context.prisma.$graphql(query) 
    if(!res[model])
        return false 
    return true
  })
}
