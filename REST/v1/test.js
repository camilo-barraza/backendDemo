var express = require('express');
var db = require('../../admin_panel/models')
var router = express.Router();


router.get('/' , async function (req, res, next) {
  try{
    let payload = await db.User.findAll({
      include:[{
        model:db.Post
      }]
    }) ; 
    res.send(200)
  } catch(err){
      next(err)
  }
});

module.exports = router;
