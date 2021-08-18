'use strict'

const fs = require('fs');
const util = require('util');
const lo = require('lodash');
const { userInfo } = require('os');

module.exports.getProcesslist = async function(rows, outfile1, outfile2) {
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
      if ( outer.length === 20 ) { break }
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
      {"text":"Rows_sent","type":"number"},
      {"text":"Rows_examined","type":"number"}
      ],
      "rows": outer,
      "type":"table",
      "startTime": start_time,
      "stopTime":  stop_time
   }

   fs.writeFileSync(outfile2, JSON.stringify(dat), {flag: 'a+'})
}

module.exports.getProcesses = async function(rows,outfile1,outfile2) {

   var outer = [];
   let pid, puser, phost, pdb, pcomm, ptime, pstate, pinfo, prows_sent, prows_examined;

   var start_time = JSON.parse(fs.readFileSync(outfile1, 'utf8'))[0]['startTime'];
   var stop_time = JSON.parse(fs.readFileSync(outfile1, 'utf8'))[0]['stopTime'];
   
   for (var rec of rows) {
      for (var i in rec) {
         var row = rec[i].split(/:(.+)/);
         if (lo.trimStart(row[0]) === "Id") {
            pid = parseInt(lo.trimStart(row[1]));
         } else if (lo.trimStart(row[0]) === "User") {
            puser = lo.trimStart(row[1]);
         } else if (lo.trimStart(row[0]) === 'Host') {
            phost = lo.trimStart(row[1]);
         } else if (lo.trimStart(row[0]) === 'db') {
            pdb = lo.trimStart(row[1]);
         } else if (lo.trimStart(row[0]) === 'Command') {
            pcomm = lo.trimStart(row[1]);
         } else if (lo.trimStart(row[0]) === 'Time') {
            ptime = parseInt(lo.trimStart(row[1]));
         } else if (lo.trimStart(row[0]) === 'State') {
            pstate = lo.trimStart(row[1]);
         } else if (lo.trimStart(row[0]) === 'Info') {
            pinfo = lo.trimStart(row[1]);
         } else if (lo.trimStart(row[0]) === 'Rows_sent') {
            prows_sent = parseInt(lo.trimStart(row[1]));
         } else if (lo.trimStart(row[0]) === 'Rows_examined') {
            prows_examined = parseInt(lo.trimStart(row[1]));
         }
      }

      var dat = {
         "Id": pid,
         "User": puser,
         "Host": phost,
         "db": pdb,
         "Command": pcomm,
         "Time": ptime,
         "State": pstate,
         "Info": pinfo,
         "Rows_sent": prows_sent,
         "Rows_examined": prows_examined,
         "startTime": start_time,
         "stopTime": stop_time
      }

      outer.push(dat);
         
   }
   
   fs.writeFileSync(outfile2, JSON.stringify(outer), {flag: 'a+'})

}