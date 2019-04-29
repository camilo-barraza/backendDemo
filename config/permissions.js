const { shield, and, or, not } = require('graphql-shield')
const { isAuthenticated, isAdmin, isAgent, isClient, isAccount, isStore, isData , isOwner , inInstance } = require('./rules')

module.exports = shield({
  Query: {
    // hello: and(isAuthenticated, or(isAdmin,isAccount)) ,
  },
  Mutation: {
    // updateFeedPost: isOwner, 
    // updateFeedPostComment: and(isOwner, or(inInstance , isAdmin ) ) , 
    // signupUser: and(isAuthenticated,isAdmin)
  }
})
