'use strict'

const fs = require('fs');
const util = require('util');
const lodash = require('lodash');

async function getInterval(stext) {
    // Get uptime interval
    let firstVal = 0;
    let secondVal = 0;
    let count = 0;
    for (var c in stext) {
        if (stext[c][0] === 'Uptime') {
            if (count === 0) {
                firstVal = stext[c][1];
            } else if (count === 1) {
                secondVal = stext[c][1];
            } else {
                break;
            }
        } else {
            continue;
        }
        count+=1;
    }
    return (secondVal - firstVal) * 1000;
}

module.exports.parseFile = async function(stext, outfile, unixTime) {

    var interVal = await getInterval(stext);

    // Get key names
    var keyNames = stext.map( row => row[0] );

    // Remove duplicate keys from keyNames array
    var keyList = lodash.uniq(keyNames);

    var finalDoc = new Array();
    for (var key in keyList) {
        var valuesArray = new Array();
        var unixTimeStamp = parseInt(unixTime);
        for (var v in stext) {
            if (stext[v][0] === keyList[key]) {
                var dp = [ parseInt(stext[v][1]), unixTimeStamp ];
                valuesArray.push(dp);
                unixTimeStamp = parseInt(unixTimeStamp) + parseInt(interVal);
            }
            
        }
        if (valuesArray.length !== 0) {
            var doc = {
                "target": keyList[key],
                "datapoints": valuesArray,
                "type": "timeseries",
                "startTime": parseInt(unixTime),
                "stopTime": (parseInt(unixTime) + ((valuesArray.length-1)*interVal))
            };
        }
        finalDoc.push(doc);
    }
    fs.writeFileSync(outfile, JSON.stringify(finalDoc), {flag: 'a+'})
}

module.exports.getDeltas = async function(stext, outfile, unixTime) {

    var interVal = await getInterval(stext);

    // Get key names
    var keyNames = stext.map( row => row[0] );

    // Remove duplicate keys from keyNames array
    var keyList = lodash.uniq(keyNames);

    var arrList = new Array();
    for (var key in keyList) {
        var innerArr = new Array();
        innerArr.push(keyList[key]);
        for (var i in stext) {
            if (stext[i][0] === keyList[key]) {
                innerArr.push(stext[i][1]);
            }
        }
        arrList.push(innerArr.join(' '));
    }

    var delta = new Array();
    for (var key in keyList) {
        for (var i in arrList) {
            var unixTimeStamp = parseInt(unixTime);
            var row = arrList[i].split(' ');
            if (row[0] === keyList[key]) {
                var dpoints = new Array();
                for (var step=1; step<row.length-1;step++) {
                    if (step === 1) {
                        var doc = [ parseInt(row[step]), parseInt(unixTimeStamp) ]
                        dpoints.push(doc);
                    } else {
                        unixTimeStamp = parseInt(unixTimeStamp) + parseInt(interVal);
                        var doc = [ parseInt(row[step+1] - row[step]), parseInt(unixTimeStamp) ]
                        dpoints.push(doc);
                    }
                }
                var outerDoc = {
                    "target": util.format("%s_delta", row[0]),
                    "datapoints": dpoints,
                    "type": "timeseries",
                    "startTime": parseInt(unixTime),
                    "stopTime": (parseInt(unixTime) + ((dpoints.length-1)*interVal))
                }
                delta.push(outerDoc);
            }
        }
    }
    fs.writeFileSync(outfile, JSON.stringify(delta), {flag: 'a+'})
}
