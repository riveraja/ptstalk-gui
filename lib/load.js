'use strict'

const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const client = require('../db/mongo');

module.exports.globalStats = async function(outfile) {
    const stalk = client.db('ptstalk').collection('statistics');
    var stats = fs.readFileSync(outfile,'utf8')
    var statsJson = JSON.parse(stats);
    for (var i in statsJson) {
        try {
            await insertOneDocument(stalk, statsJson[i]);
        } catch(e) {
            console.log(e.errmsg);
        }
    }
    await client.close();
} 

async function insertOneDocument(stalk,row) {
    const result = await stalk.insertOne(row);
}
