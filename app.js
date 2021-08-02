'use strict'
const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const randstring = require('randomstring');
const sizeOf = require('object-sizeof');
const mysqlAdmin = require('./lib/mysqladmin');
const loadData = require('./lib/load');
const madminFile = 'stalksamples/2021_04_03_16_49_06-mysqladmin';

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

async function main() {
    var outfile1 = await randfile();
    var outfile2 = await randfile();
    var unixTime = await getUnixTime(madminFile);

    let madmin = new Array();
    try {
        let re = /(used_connections_time|wsrep_ready|provider_name|cluster_status|state_comment|flow_control_status|flow_control_interval|snapshot_gtid|snapshot_file|dump_status|load_status|resize_status|cache_mode|Rsa_public|tls|version|address|cert_deps|uuid|wsrep_evs|Variable_name|\+---|Ssl_server|Ssl_cipher|Caching_sha2|END)/i;
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

    await loadData.globalStats(outfile1);
    await loadData.globalStats(outfile2);

    
    process.exit(0)
}

main().catch(console.error);
