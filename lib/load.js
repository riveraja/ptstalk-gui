'use strict'

const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const client = require('../db/mongo');

module.exports.globalStats = async function(outfile, task) {
    const stalk = client.db(task).collection('captures');
    var stats = fs.readFileSync(outfile,'utf8')
    var statsJson = JSON.parse(stats);
    try {
        await stalk.insertMany(statsJson);
    } catch(e) {
        console.log(e.errmsg);
    }
} 
