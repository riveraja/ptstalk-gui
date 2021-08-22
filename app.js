#!/usr/bin/env node

'use strict'
const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const randstring = require('randomstring');
const { program } = require('commander');
const mysqlAdmin = require('./lib/mysqladmin');
const processList = require('./lib/processlist');
const loadData = require('./lib/load');
const api = require('./api');

program
    .version('0.2.0')
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
    files.map( file => fs.rmSync(file));
}

async function main() {
    const options = program.opts();
    const Path = `${options.dir}`;
    const task = `${options.task}`;

    var fileByDate = [];
    fs.readdirSync(Path, 'utf8').forEach( function(file) {
        fileByDate.push( file.replace(/(\-\w+)/g, '') );
    })
    
    var uniqueDates = lodash.uniq(fileByDate);

    var initTime = 0;
    var endTime = 0;

    var counter = 1;
    for await (var uniqueDate of uniqueDates) {

        var outfiles = [];

        var madminFile = util.format("%s%s-mysqladmin", Path, uniqueDate);
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

        var outfile1 = await randfile();
        console.log("Parsing files %s of %s sets", counter, uniqueDates.length);
        await mysqlAdmin.parseFile(data, outfile1, unixTime);
        outfiles.push(outfile1);

        var startT = JSON.parse(fs.readFileSync(outfile1, 'utf8'))[0]['startTime'];
        var stopT = JSON.parse(fs.readFileSync(outfile1, 'utf8'))[0]['stopTime'];
        console.log(util.format("Start: %s | Stop: %s", startT, stopT));

        if ( count === 1 ) {
            initTime = startT;
        } else if ( count === uniqueDates.length ) {
            endTime = stopT;
        }

        var outfile2 = await randfile();
        await mysqlAdmin.getDeltas(data, outfile2, unixTime);
        outfiles.push(outfile2);

        var processlistFile = util.format("%s%s-processlist", Path, uniqueDate);

        var file = fs
                    .readFileSync(processlistFile,'utf8')
                    .split(/(\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)/)

        file = file.slice(1,file.length)
        var s = [];
        for (var T in file) {
            let re = /(\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*|\d+\. row)/g
            var t = file[T].split('\n');
            if (!re.exec(t)) {
                s.push(t.slice(1,11));
            }
        }

        var rows = [];
        s.forEach( function(e) {
            rows.push(e)
        })

        var outfile3 = await randfile();
        await processList.getProcesslist(rows, outfile1, outfile3);
        outfiles.push(outfile3);

        var outfile4 = await randfile();
        await processList.getProcesses(rows, outfile1, outfile4);
        outfiles.push(outfile4);

        await loadData.globalStats(outfile1, task);
        await loadData.globalStats(outfile2, task);
        await loadData.processList(outfile3, task);
        await loadData.processListRows(outfile4, task);

        await rmtmp(outfiles);
        counter += 1;
    };

    api.api(
        process.env.DBUSER,
        process.env.DBPASS,
        process.env.DBHOST,
        process.env.DBPORT,
        task,
        process.env.APIHOST,
        process.env.APIPORT
    );

    var grafana_url = "http://localhost:3000/d/percona/pt-stalk-dashboard?orgId=1&from=%s&to=%s"
    console.log(util.format(grafana_url, initTime, endTime));
    // process.exit(0)
}

main().catch(console.error);
