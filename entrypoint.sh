#!/bin/bash
service grafana-server start
/usr/bin/percona-server-mongodb-helper.sh
sudo -u mongod /usr/bin/env /usr/bin/mongod -f /etc/mongod.conf > /var/log/mongo/mongod.stdout 2>/var/log/mongo/mongod.stderr
cd /opt/ptstalk-gui
curl --verbose -s -L -u 'admin:admin' -H 'Accept: application/json' -H 'Content-Type: application/json' -X POST http://localhost:3000/api/datasources -d @add-json-datasource.json
cat dashboards/ptstalk-dashboard.json | jq '. * { overwrite: true, dashboard: {id: null} }' | curl --verbose -L -s --fail -u 'admin:admin' -H 'Accept: application/json' -H 'Content-Type: application/json' -X POST -k http://localhost:3000/api/dashboards/db --data @-
node /opt/ptstalk-gui/app.js -D /var/lib/pt-stalk/ -t ptstalk
