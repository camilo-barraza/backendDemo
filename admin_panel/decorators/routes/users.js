const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
var db  = require('../../models');

router.delete('/users/:userId', Liana.ensureAuthenticated,
  async (req, res, next) => {
    try {
      let data = await db.User.find({
        where: {
          id: req.params.userId,
        }
      });
      next();
    }
    catch (err) {
      next(err);
    }
  });

module.exports = router;
