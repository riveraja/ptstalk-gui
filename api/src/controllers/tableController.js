const debug = require('debug')('app:controllers:table');
const Capture = require('../models/captureModel');

// TODO: Waiting for a separate collection for processlist to allow searching, pagination, etc.

exports.index = (req, res) => {
  const startTime = req.query.from || 0;
  const stopTime = req.query.to || 0;
  
  Capture.find({
    $and: [
      { "target": "processlist" },
      { $or: 
        [  
          { $and: [{"startTime": {$gte: startTime}},{"stopTime": {$lte: stopTime}}]},
          { $and: [{"startTime": {$lte: startTime}},{"stopTime": {$gte: startTime}}]},
          { $and: [{"startTime": {$lte: stopTime}},{"stopTime": {$gte: stopTime}}]}
        ]
      }
    ]
  }
  , function (err, captures) {
    debug(`Captures: ${captures.length}`);
    if (captures > 0) {
      res.render('index', { columns: captures[0].columns, captures: captures});
    }
    else {
      const date = new Date().toISOString();
      res.send(`No result. The current time is ${date}.`);
      res.end();
    }
  });
  
}