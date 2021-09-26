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

module.exports.createProcesslistIndex = async function(task) {
    const stalk = client.db(task).collection('processlists');
    const result = await stalk.createIndex({User: "text", Host: "text", db: "text", Command: "text", State: "text", Info: "text" });
    console.log("Created index: %s", result);
}
