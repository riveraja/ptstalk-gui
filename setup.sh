yum install epel-release vim less jq git -y
yum install -y https://dl.grafana.com/oss/release/grafana-8.1.2-1.x86_64.rpm
grafana-cli plugins install simpod-json-datasource
systemctl start grafana-server

curl --verbose -s -L -u "admin:admin" -H "Accept: application/json" -H "Content-Type: application/json" -X POST http://localhost:3000/api/datasources -d @add-json-datasource.json
cat dashboards/ptstalk-dashboard.json | jq '. * { overwrite: true, dashboard: {id: null} }' | curl --verbose -L -s --fail -u "admin:admin" -H "Accept: application/json" -H "Content-Type: application/json" -X POST -k http://localhost:3000/api/dashboards/db --data @-

yum install https://repo.percona.com/yum/percona-release-latest.noarch.rpm -y
percona-release enable psmdb-44
yum install percona-server-mongodb -y
systemctl start mongod

yum install -y gcc-c++ make 
curl -sL https://rpm.nodesource.com/setup_14.x | bash -
yum install nodejs  -y
npm install
npm link
