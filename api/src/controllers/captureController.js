const debug = require('debug')('app:controllers:capture');
const Capture = require('../models/captureModel');

const maxProcessListSizePerCapture = 20;

exports.index = (req, res) => {
  const date = new Date().toISOString();
  res.send(`Welcome to JSON API of pt-stalk data. The current time is ${date}.`);
  res.end();
}

exports.search = (req, res) => {
  Capture.find({}, "target", { sort: { target: 1 } }, function (err, captures) {
    if (err) return handleError(err);
    results = [];
    captures.forEach((capture) => {
      if (this.results.indexOf(capture.target) == -1) {
        results.push(capture.target);
      }
    });
    res.send(results);
    res.end();
  });
}

exports.query = (req, res) => {
  targetAttributes = [];
  targetTypes = [];
  debug(req.body);
  for (target of req.body.targets) {
    targetAttributes.push(target.target);
    targetTypes.push(target.type);
  }
  debug(targetAttributes);
  debug(targetTypes);
  startTime = Date.parse(req.body.range.from);
  debug(`Start time: ${startTime}`)
  stopTime = Date.parse(req.body.range.to);
  debug(`Stop time: ${stopTime}`)

  Capture.find({
      $and: [
        { "target": { $in: targetAttributes }},
        { $or: 
          [  
            { $and: [{"startTime": {$gte: startTime}},{"stopTime": {$lte: stopTime}}]},
            { $and: [{"startTime": {$lte: startTime}},{"stopTime": {$gte: startTime}}]},
            { $and: [{"startTime": {$lte: stopTime}},{"stopTime": {$gte: stopTime}}]}
          ]
        }
      ]
    }, function (err, captures) {
      if (err) return handleError(err);
      results = [];
      captures.forEach((capture) => {
        if (capture.type == "timeseries") {
          found = false;
          for (i=0; i < results.length; i++) {
            // If target is already in the results array, append more datapoints to it
            if (results[i].target == capture.target) {
              // If target name ends with _delta, do not insert the first entry  
              // since it contains the current value
              firstEntry = true;
              capture.datapoints.forEach((datapoint) => {
                if (!capture.target.endsWith("_delta") || !firstEntry) {
                  datapointData = [];
                  datapointData.push(datapoint[0]);
                  datapointData.push(datapoint[1]);
                  results[i].datapoints.push(datapointData);
                }
                else {
                  firstEntry = false;
                }
              });
              found = true;
            }
          }
          // If target is not yet in the results array, add target to results array with
          // datapoints
          if (!found) {
            target = {};
            datapoints = [];
            tsResult = [];
            firstEntry = true;
            capture.datapoints.forEach((datapoint) => {
              // If target name ends with _delta, do not insert the first entry  
              // since it contains the current value
              if (!capture.target.endsWith("_delta") || !firstEntry) {
                datapointData = [];
                datapointData.push(datapoint[0]);
                datapointData.push(datapoint[1]);
                datapoints.push(datapointData);
              }
              else {
                firstEntry = false;
              }
            });
            target = {
              target: capture.target,
              datapoints: datapoints,
              type: "timeseries"
            }
            results.push(target);
          }
        }
        else if (capture.type == "table") {
          found = false;
          for (i=0; (i < results.length); i++) {
            if (results[i].target == capture.target) {
              // Only add maxProcessListSizePerCapture for succeeding captures in the processlist
              // Only the first capture is provided in full
              for (j=0; ((j < capture.rows.length) && (j < maxProcessListSizePerCapture)); j++) {
                results[i].rows.push(capture.rows[j]);
              }
              found = true;
            }
          }
          if (!found) {
            target = {
              target: capture.target,
              columns: capture.columns,
              rows: capture.rows,
              type: capture.type
            }
            results.push(target);  
          }
        }
      });
    debug("ResultSet: ");
    debug(results);
    res.send(results);
    res.end();
  });
}

//TODO: Understand and implement annotations
exports.annotations = (req, res) => {
  res.send("[]");
  res.end();
}
//TODO: Understand and implement tagkeys
exports.tagkeys = (req, res) => {
  res.send("[]");
  res.end();
}
//TODO: Understand and implement tagvalues
exports.tagvalues = (req, res) => {
  res.send("[]");
  res.end();
}

