'use strict'

const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const client = require('../db/mongo');

module.exports.globalStats = async function(outfile, task) {
    const stalk = client.db(task).collection('captures');
    var stats = JSON.parse(fs.readFileSync(outfile,'utf8'));
    try {
        await stalk.insertMany(stats);
    } catch(e) {
        console.log(e.errmsg);
    }
}

module.exports.processList = async function(outfile, task) {
    const stalk = client.db(task).collection('captures');
    var stats = JSON.parse(fs.readFileSync(outfile,'utf8'));
    try {
        await stalk.insertOne(stats);
    } catch(e) {
        console.log(e.errmsg);
    }
}

module.exports.processListRows = async function(outfile, task) {
    const stalk = client.db(task).collection('processlists');
    var stats = JSON.parse(fs.readFileSync(outfile,'utf8'));
    try {
        await stalk.insertMany(stats);
    } catch(e) {
        console.log(e.errmsg);
    }
}
