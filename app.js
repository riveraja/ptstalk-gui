#!/usr/bin/env node

'use strict'
const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const randstring = require('randomstring');
const { program } = require('commander');
const mysqlAdmin = require('./lib/mysqladmin');
const loadData = require('./lib/load');

program
    .version('0.1.0')
    .option('-D, --dir <directory>', 'Path to pt-stalk files')
    .option('-t, --task <task>', 'ServiceNow ticket number', 'percona');

program.parse(process.argv);

async function randfile() {
    return util.format('/tmp/%s.txt',randstring.generate(12));
}

async function getUnixTime(madminFile) {
    const fn = madminFile.split('/');
    const fileName = fn[fn.length-1];
    var dateObject = lodash.trim(fileName,'-mysqladmin').split('_');
    var dateString = util.format('%s-%s-%s %s:%s:%s.000',dateObject[0],dateObject[1],dateObject[2],dateObject[3],dateObject[4],dateObject[5]);
    return Math.floor(new Date(dateString).getTime()/1000) + "000";
}

async function rmtmp(files=[]) {
    // for (var f in files) {
    //     fs.rmSync(files[f]);
    // }
    files.map( file => fs.rmSync(file));
}

async function main() {
    const options = program.opts();
    const Path = `${options.dir}`;
    const task = `${options.task}`;

    var fileList = [];
    fs.readdirSync(Path, 'utf8').forEach( function(file) {
        let re = /\-mysqladmin/g
        if (re.exec(file)) {
            fileList.push(util.format('%s%s', Path, file));
        }
    })
    
    for await (var fileToParse of fileList) {

        var madminFile = fileToParse;
        var outfile1 = await randfile();
        var outfile2 = await randfile();
        var unixTime = await getUnixTime(madminFile);

        let madmin = new Array();
        try {
            let re = /(used_connections_time|wsrep_ready|provider_name|cluster_status|state_comment|flow_control_status|flow_control_interval|snapshot_gtid|snapshot_file|dump_status|load_status|resize_status|cache_mode|Rsa_public|tls|version|address|cert_deps|uuid|wsrep_evs|Variable_name|\+---|Ssl_server|Ssl_cipher|Caching_sha2|END)/g;
            fs.readFileSync(madminFile,'utf8').split('\n').forEach( function(e) {
                var chk = re.exec(e);
                if (!chk) {
                    madmin.push(lodash.words(e,/\w+\_\w+|\w+|\d+/g));
                }
            })
        } catch (e) {
            console.log(e);
        }

        let data = new Array();
        madmin.forEach( function(e) {
            if (e.length === 2 && !isNaN(e[1]) ) {
                data.push(e)
            }
        });

        await mysqlAdmin.parseFile(data, outfile1, unixTime);
        await mysqlAdmin.getDeltas(data, outfile2, unixTime);

        await loadData.globalStats(outfile1, task);
        await loadData.globalStats(outfile2, task);

        await rmtmp([outfile1, outfile2]);

    };
    
    process.exit(0)
}

main().catch(console.error);
