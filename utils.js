const { verify } = require('jsonwebtoken')
const { sign } = require('jsonwebtoken')

// TODO set as env variable
const APP_SECRET = 'appsecret321'

class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

function getUser(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, APP_SECRET)
    return verifiedToken
  }
}

// use secret from prisma.yml
// TODO update secret to env variable
function getPrismaServerToken () {
  // token never expires
  return sign({ 
    data: {
      service: "default@default",
      roles: [
        "admin"
      ]
    },
  }, process.env.API_SECRET )
}


module.exports = {
  getUser,
  getPrismaServerToken,
  APP_SECRET,
}
