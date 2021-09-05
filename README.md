# ptstalk-gui

### Setup and installation

Currently supports CentOS7

```
git clone -b add-dockerfile http://github.com/riveraja/ptstalk-gui
cd ptstalk-gui/
bash setup.sh
```

### Contributing to the dashboards

After adding or editing dashboards from grafana, use the HTTP-API to export your dashboard and send a PR

```
curl -s -u "admin:admin" -H "Accept: application/json" -H "Content-Type: application/json"  http://localhost:3000/api/dashboards/uid/percona | jq . > ptstalk-dashboard.json
```



### Sample URL with from/to timestamps
```
http://localhost:3000/d/percona/pt-stalk-dashboard?orgId=1&from=1617468546000&to=1617468580000
```


### Using docker
```
docker run --name ptstalk -it --rm -p 3000:3000 -p 9000:9000 -v  /path/to/pt-stalk:/var/lib/pt-stalk riveraja/ptstalk-gui
```

