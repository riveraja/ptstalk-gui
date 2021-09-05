/*
  Can be used to start API if backend is already populated and the app was stopped
*/
const api = require('./api');
api.api(
   '', //USERNAME
   '', //PASSWORD
   '127.0.0.1', //DB_HOST 
   27017, //DB_PORT
   'ptstalk', //DATABASE
   '0.0.0.0', //API_HOST
   9000 // API_PORT
);

