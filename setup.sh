yum install https://dl.grafana.com/oss/release/grafana-8.1.2-1.x86_64.rpm
grafana-cli plugins install simpod-json-datasource
systemctl start grafana-server

# cat add-json-datasource
# {
#   "name":"JSON",
#   "typeName":"JSON",
#   "type":"simpod-json-datasource",
#   "url":"http://0.0.0.0:9000/api",
#   "access":"proxy",
#   "basicAuth":false
# }

curl -s -u "admin:admin" -H "Content-type: application/json" http://localhost:3000/api/datasources -d @add-json-datasource

# curl -s http://admin:admin@localhost:3000/api/dashboards/uid/:uid | jq . > ptstalk-dashboard.json

cat ptstalk-dashboard.json | jq '. * { overwrite: true, dashboard: {id: null} }' | curl --verbose -L -s --fail -H "Accept: application/json" -H "Content-Type: application/json" -X POST -k http://admin:admin@localhost:3000/api/dashboards/db --data @-

# Sample URL with from/to timestamps
# http://192.168.1.12:3000/d/percona/pt-stalk-dashboard?orgId=1&from=1617468546927&to=1617468557104

yum install https://repo.percona.com/yum/percona-release-latest.noarch.rpm -y
percona-release enable psmdb-44
yum install psmdb-44 -y

