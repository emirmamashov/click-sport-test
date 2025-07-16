const express = require('express');
const router = express.Router();

module.exports = (app, db) => {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.status(200).json({
      msg: 'api working!'
    });
  });

  app.use('/', router);
};
