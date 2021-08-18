const mongoose = require('mongoose');

const columnSchema = mongoose.Schema({
  text: { type: String },
  type: { type: String }
});

const captureSchema = mongoose.Schema({
  target: { type: String },
  type: { type: String},
  datapoints: [[]],
  columns: [ columnSchema ],
  rows: [[]],
  startTime: { type: Number },
  stopTime: { type: Number }
});
module.exports = mongoose.model('capture', captureSchema);
