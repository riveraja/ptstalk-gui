'use strict'
const mysqlAdmin = require('./lib/mysqladmin');
const client = require('./db/mongo');
const rootPath = 'stalksamples/';
const fileName = '2021_04_03_16_49_06-mysqladmin';

async function main() {
    const stalk = client.db('ptstalk').collection('mysqladmins');
    const doc = await mysqlAdmin.parseFile(rootPath,fileName);
    for (var i=0; i < doc.length; i++) {
        try {
            await insertOneDocument(stalk, doc[i]);
        } catch(e) {
            // console.log(doc[i]); // DEBUG only
            console.log(e.errmsg);
        }
    }
    await client.close();
    process.exit(0)
}

main().catch(console.error);

async function insertOneDocument(stalk,row) {
    const result = await stalk.insertOne(row);
    // console.log(result.insertedId); // DEBUG only
}
