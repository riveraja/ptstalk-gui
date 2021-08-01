'use strict'

const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
// const sizeOf = require('object-sizeof');

async function getInterval(stext) {
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
    return (secondVal - firstVal) * 1000;
}

module.exports.parseFile = async function(stext, outfile, unixTime) {

    var interVal = await getInterval(stext);

    // Get key names
    var keyNames = new Array();
    for (var k in stext) {
        var kk = stext[k].split(' ');
        keyNames.push(kk[0])
    }

    // Remove duplicate keys from keyNames array
    var keyList = lodash.uniq(keyNames);

    var finalDoc = new Array();
    for (var key in keyList) {
        var valuesArray = new Array();
        var unixTimeStamp = parseInt(unixTime);
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
                "datapoints": valuesArray
            };
        }
        finalDoc.push(doc);
    }
    fs.writeFileSync(outfile, JSON.stringify(finalDoc), {flag: 'a+'})
}

module.exports.getDeltas = async function(stext, outfile, unixTime) {

    var interVal = await getInterval(stext);

    
    // Get key names
    var keyNames = new Array();
    for (var k in stext) {
        var kk = stext[k].split(' ');
        keyNames.push(kk[0])
    }

    // Remove duplicate keys from keyNames array
    var keyList = lodash.uniq(keyNames);

    let re = /(uuid|Rsa_public_key|END)/i;
    keyList.forEach( function(e) {
        var T = re.exec(e);
        if (!T) {
            console.log(e);
        }
    } )
}
