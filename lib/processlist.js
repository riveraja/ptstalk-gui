'use strict'

const fs = require('fs');
const util = require('util');
const lo = require('lodash');

module.exports.getProcesses = async function(rows, outfile1, outfile2) {
   var outer = [];
   for (var rec of rows) {
      var inner = [];
      for (var i in rec) {
         let reInt = /(Id|Time)/g
         let reString = /(User|Host|db|Command|State|Info)/g
         let reRows = /(Rows_sent|Rows_examined)/g
         if (reInt.exec(rec[i])) {
            var item = rec[i].split(/:(.+)/);
            inner.push(parseInt(lo.trimStart(item[1])));
         } else if (reString.exec(rec[i])) {
            var item = rec[i].split(/:(.+)/);
            inner.push(lo.trimStart(item[1]));
         } else if (reRows.exec(rec[i])) {
            var item = rec[i].split(/:(.+)/);
            inner.push(parseInt(lo.trimStart(item[1])));
         }
      }
      outer.push(inner)
   }

   var start_time = JSON.parse(fs.readFileSync(outfile1, 'utf8'))[0]['startTime']
   var stop_time = JSON.parse(fs.readFileSync(outfile1, 'utf8'))[0]['stopTime']

   var dat = {
      "target": "processlist",
      "columns":[
      {"text":"Id","type":"number"},
      {"text":"User","type":"string"},
      {"text":"Host","type":"string"},
      {"text":"db","type":"string"},
      {"text":"Command","type":"string"},
      {"text":"Time","type":"number"},
      {"text":"State","type":"string"},
      {"text":"Info","type":"string"},
      {"text":"Rows_sent","type":"string"},
      {"text":"Rows_examined","type":"string"}
      ],
      "rows": outer,
      "type":"table",
      "startTime": start_time,
      "stopTime":  stop_time
   }

   fs.writeFileSync(outfile2, JSON.stringify(dat), {flag: 'a+'})
}