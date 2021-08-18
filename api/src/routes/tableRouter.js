const express = require('express');

const tableRouter = express.Router();

const tableController = require('../controllers/tableController');

const helpers = require('../shared/helpers');

tableRouter.use((req, res, next) => {
  helpers.setHeaders(res);
  next();
});


tableRouter.all('/', tableController.index);


module.exports = tableRouter;
