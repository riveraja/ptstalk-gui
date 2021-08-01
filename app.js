'use strict'
const fs = require('fs');
const util = require('util');
const lodash = require('lodash');
const randstring = require('randomstring');
const sizeOf = require('object-sizeof');
const mysqlAdmin = require('./lib/mysqladmin');
const client = require('./db/mongo');
const fullFilePath = 'stalksamples/2021_04_03_16_49_06-mysqladmin';

async function randfile() {
    return util.format('/tmp/%s.txt',randstring.generate(12));
}

async function getUnixTime(fullFilePath) {
    const fn = fullFilePath.split('/');
    const fileName = fn[fn.length-1];
    var dateObject = lodash.trim(fileName,'-mysqladmin').split('_');
    var dateString = util.format('%s-%s-%s %s:%s:%s.000',dateObject[0],dateObject[1],dateObject[2],dateObject[3],dateObject[4],dateObject[5]);
    return Math.floor(new Date(dateString).getTime()/1000) + "000";
}

async function main() {
    // const stalk = client.db('ptstalk').collection('mysqladmins');
    var outfile = await randfile();
    var unixTime = await getUnixTime(fullFilePath);

    let origFile = new Array();
    try {
        let re = /(used_connections_time|wsrep_ready|provider_name|cluster_status|state_comment|flow_control_status|flow_control_interval|snapshot_gtid|snapshot_file|dump_status|load_status|resize_status|cache_mode|Rsa_public|tls|version|address|cert_deps|uuid|wsrep_evs|Variable_name|\+---|Ssl_server|Ssl_cipher|Caching_sha2|END)/i;
        fs.readFileSync(fullFilePath,'utf8').split('\n').forEach( function(e) {
            var chk = re.exec(e);
            if (!chk) {
                origFile.push(lodash.words(e,/\w+\_\w+|\w+|\d+/g));
            }
        })
    } catch (e) {
        console.log(e);
    }

    let data = new Array();
    origFile.forEach( function(e) {
        if (e.length === 2 && !isNaN(e[1]) ) {
            data.push(e)
        }
    });

    console.log(sizeOf(data))
    // let data = '';
    // for (var sp in origFile) {
    //     var t1 = origFile[sp].split(' ').filter(function(e) { return e !== '|' && e !== '' });
    //     if ((typeof t1[0]) === 'undefined' || (typeof t1[1]) === 'undefined') { continue };
    //     data += util.format("%s %d\n", t1[0], t1[1]);
    // }

    // data = data.split('\n').filter( function(s) {
    //     if (s !== 'NaN') { return s };
    // })

    // await mysqlAdmin.parseFile(data, outfile, unixTime);
    // await mysqlAdmin.getDeltas(data,outfile,unixTime);

    // for (var i=0; i < doc.length; i++) {
    //     try {
    //         await insertOneDocument(stalk, doc[i]);
    //     } catch(e) {
    //         // console.log(doc[i]); // DEBUG only
    //         console.log(e.errmsg);
    //     }
    // }
    // await client.close();
    process.exit(0)
}

main().catch(console.error);

// async function insertOneDocument(stalk,row) {
//     const result = await stalk.insertOne(row);
//     // console.log(result.insertedId); // DEBUG only
// }
