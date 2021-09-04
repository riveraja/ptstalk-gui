const express = require('express');

const debug = require('debug')('app');
const chalk = require('chalk');

const app = express();
const mongoose = require('mongoose');

const morgan = require('morgan');
const bodyParser = require('body-parser');

const path = require('path');

const pug = require('pug');

const captureRouter = require('./api/src/routes/captureRouter');
const tableRouter = require('./api/src/routes/tableRouter');

exports.api = (dbUser, dbPassword, dbHost, dbPort, dbName, apiHost, apiPort) => {
  var credentials = `${dbUser}:${dbPassword}@`;
  if (credentials == ":@") {
    credentials = "";
  }
  mongoose
  .connect(
    `mongodb://${credentials}${dbHost}:${dbPort}/${dbName}`,
    { useNewUrlParser: true,  useUnifiedTopology: true }
  )
  .then(() => {
    debug(`Connected to mongodb://${dbHost}:${dbPort}`);
  })
  .catch(() => {
    debug(`Connection failed to mongodb://${dbHost}:${dbPort}`);
  });
  app.set('views', path.join(__dirname, 'api/src/views'));
  app.set('view engine', 'pug');

  app.use(bodyParser.json());
  app.use(morgan('tiny')); 
  app.use(express.urlencoded({
    extended: true
  }))
  app.use("/public", express.static(path.join(__dirname, "api/public")));
  app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
  app.use("/bootstrap-icons", express.static(path.join(__dirname, "node_modules/bootstrap-icons")));
  app.use("/tablesort", express.static(path.join(__dirname, "node_modules/tablesort/dist")));

  app.use('/api', captureRouter);
  app.use('/table', tableRouter);

  app.listen(apiPort, apiHost, () => {
    debug(`API running on ${chalk.green(apiPort)}`);
  });
}
