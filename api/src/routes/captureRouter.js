const express = require('express');

const captureRouter = express.Router();

const captureController = require('../controllers/captureController');

const helpers = require('../shared/helpers');

captureRouter.use((req, res, next) => {
  helpers.setHeaders(res);
  next();
});


captureRouter.all('/', captureController.index);
captureRouter.all('/search', captureController.search);
captureRouter.all('/query', captureController.query);
captureRouter.all('/annotations', captureController.annotations);
captureRouter.all('/tag-keys', captureController.tagkeys);
captureRouter.all('/tag-values', captureController.tagvalues);


module.exports = captureRouter;
