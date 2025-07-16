const express = require('express');
const router = express.Router();

// validate forms
const shoppingListForm = require('../forms/shopping-list');

module.exports = (app, db) => {
  const MasterQuery = app.get('masterQuery');
  const config = app.get('config');
  const filters = app.get('filters');

  /* POST add new Incoming. */
  router.post('/add', filters.input.validate(shoppingListForm), async (req, res) => {
    try {
      console.log('req.body', req.body);
      const shoppingList = await db.ShoppingList.findOne({name: req.body['name']});
      if (shoppingList) {
        return res.status(404).json({
          success: false,
          msg: 'Товар с таким именем уже существует! Пожалуйста выберите другую.'
        });
      }

      res.status(200).json(await MasterQuery.add(config.Models.ShoppingList.model, req.body));
    } catch (e) {
      res.status(500).json({
        msg: 'something wrong!'
      });
    }
  });

  /* POST remove */
  router.post('/remove', async (req, res) => {
    try {
      const shoppingList = await db.ShoppingList.findOne({_id: req.body['_id']});
      if (!shoppingList) {
        return res.status(404).json({
          success: false,
          msg: 'Товар не найден!'
        });
      }

      res.status(200).json(await MasterQuery.remove(config.Models.ShoppingList.model, req.body));
    } catch (e) {
      res.status(500).json({
        msg: 'something wrong!'
      });
    }
  });

  /* GET all */
  router.get('/', async (req, res) => {
    try {
      req.body.query = {};
      if (req.query) {
        if (req.query.text) {
          const regex = new RegExp('^' + req.query.text, 'i'); // ищет только начальное совпадение
          const regex2 = new RegExp('\\ ' + req.query.text, 'i'); // ищет слова с пробелСлова = \ слова/i
          req.body.query.$or = [
            { 'name': regex },
            { 'name': regex2 }
          ]
        }

        if (req.query.page && Number(req.query.page)) {
          req.body.page = req.query.page;
        }

        if (req.query.limit && Number(req.query.limit)) {
          req.body.limit = req.query.limit || 100;
        }

        if (Number(req.query.code)) {
          req.body.query.code = req.query.code;
        }
      }

      res.status(200).json(await MasterQuery.getAll(config.Models.ShoppingList.model, req.body));
    } catch (e) {
      res.status(500).json({
        msg: 'something wrong!'
      });
    }
  });

  app.use('/shopping-list', router);
};
