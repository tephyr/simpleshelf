#!/bin/sh
## CouchDB initialization script ##
## REQUIRES the following programs: curl, docker, tee, tree
## PASS IN THE USER AND PASSWORD, THEN RUN IN THE SAME ROOT DIRECTORY AS DOCKER-COMPOSE. ##
CDB_USER=$1
CDB_PASSWORD=$2
CDB_LOCALD="docker-couchdb/etc/local.d"
CDB_NAME="cdb_setup"
DELAY=30

sudo mkdir -p $CDB_LOCALD
echo "[chttpd]" | sudo tee $CDB_LOCALD/local.ini
echo "bind_address = any" | sudo tee --append $CDB_LOCALD/local.ini
sudo chown -R .docker docker-couchdb/

# Run it
sudo docker run -e COUCHDB_USER=$CDB_USER -e COUCHDB_PASSWORD=$CDB_PASSWORD \
    --name=$CDB_NAME --detach \
    -v $(pwd)/$CDB_LOCALD:/opt/couchdb/etc/local.d \
    -v $(pwd)/docker-couchdb/data:/opt/couchdb/data \
    -p 9191:5984 \
    apache/couchdb

echo "CONTAINER: $CDB_NAME; sleeping for $DELAY seconds before making changes"
sleep $DELAY

curl -X PUT http://$1:$2@localhost:9191/_node/nonode@nohost/_config/chttpd/bind_address -d '"0.0.0.0"'

# Add basic databases.
curl -X PUT http://$1:$2@localhost:9191/_users
curl -X PUT http://$1:$2@localhost:9191/_replicator
curl -X PUT http://$1:$2@localhost:9191/_global_changes

# Shut it down
sudo docker stop $CDB_NAME
sudo docker rm $CDB_NAME
tree $CDB_LOCALD
