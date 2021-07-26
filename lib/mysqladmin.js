'use strict'

const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
// import sizeOf from 'object-sizeof';

module.exports.parseFile = async function(rootPath, fileName) {
    var dateObject = lodash.trim(fileName,'-mysqladmin').split('_');
    var dateString = util.format('%s-%s-%s %s:%s:%s.000',dateObject[0],dateObject[1],dateObject[2],dateObject[3],dateObject[4],dateObject[5]);
    var unixTime = Math.floor(new Date(dateString).getTime()/1000) + "000";

    let origFile;
    try {
        origFile = fs.readFileSync(rootPath + fileName,'utf8').split('\n')
                        .filter( function(l) { return l.indexOf("+--") == -1 } )
                        .filter( function(x) { return x.indexOf("Variable_name") == -1 } )
    } catch (e) {
        console.log(e);
    }

    let stext = '';
    for (var sp in origFile) {
        var t1 = origFile[sp].split(' ').filter(function(e) { return e !== '|' && e !== '' });
        if ((typeof t1[0]) === 'undefined' || (typeof t1[1]) === 'undefined') { continue };
        stext += util.format("%s %d\n", t1[0], t1[1]);
    }

    stext = stext.split('\n').filter( function(s) {
        if (s !== 'NaN') { return s };
    })

    // Get uptime interval
    let firstVal = 0;
    let secondVal = 0;
    let count = 0;
    for (var c in stext) {
        var myKey = stext[c].split(' ');
        if (myKey[0] === 'Uptime') {
            if (count === 0) {
                firstVal = myKey[1];
            } else if (count ===1) {
                secondVal = myKey[1];
            } else {
                break;
            }
        } else {
            continue;
        }
        count+=1;
    }
    var interVal = (secondVal - firstVal) * 1000;

    // Get key names
    var keyNames = new Array();
    for (var k in stext) {
        var kk = stext[k].split(' ');
        keyNames.push(kk[0])
    }

    // Remove duplicate keys from keyNames array
    var keyList = lodash.uniq(keyNames);
    // console.log(util.format("Total keyList: %d", keyList.length)); //DEBUG only

    var finalDoc = new Array();
    for (var key in keyList) {
        var valuesArray = new Array();
        var unixTimeStamp = parseInt(unixTime);
        // console.log(keyList[key]); // DEBUG only
        for (var v in stext) {
            var vv = stext[v].split(' ');
            if (vv[0] === keyList[key]) {
                if (vv[1] !== 'NaN') {
                    var dp = {
                        "value": vv[1],
                        "timestamp": unixTimeStamp
                    };
                    valuesArray.push(dp);
                    unixTimeStamp = parseInt(unixTimeStamp) + parseInt(interVal);
                } else {
                    continue;
                }
            }
            
        }
        if (valuesArray.length !== 0) {
            var doc = {
                "target": keyList[key],
                "dataPoints": valuesArray
            };
        }
        finalDoc.push(doc);
    }
    // console.log(util.format("Total finalDoc: %d", finalDoc.length)); // DEBUG only
    return finalDoc;
}
