yum install epel-release vim wget less jq git -y
yum install -y https://dl.grafana.com/oss/release/grafana-8.1.2-1.x86_64.rpm
grafana-cli plugins install simpod-json-datasource
systemctl start grafana-server

curl --verbose -s -u "admin:admin" -H "Accept: application/json" -H "Content-type: application/json" http://localhost:3000/api/datasources -d @add-json-datasource.json

# curl -s http://admin:admin@localhost:3000/api/dashboards/uid/:uid | jq . > ptstalk-dashboard.json

cat ptstalk-dashboard.json | jq '. * { overwrite: true, dashboard: {id: null} }' | curl --verbose -L -s --fail -H "Accept: application/json" -H "Content-Type: application/json" -X POST -k http://admin:admin@localhost:3000/api/dashboards/db --data @-

# Sample URL with from/to timestamps
# http://192.168.1.12:3000/d/percona/pt-stalk-dashboard?orgId=1&from=1617468546927&to=1617468557104

yum install https://repo.percona.com/yum/percona-release-latest.noarch.rpm -y
percona-release enable psmdb-44
yum install percona-server-mongodb -y

yum install -y gcc-c++ make 
curl -sL https://rpm.nodesource.com/setup_14.x | bash -
yum install nodejs  -y
npm install
npm link
