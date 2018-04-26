FROM    node:carbon

LABEL   author="Andrew Ittner"

COPY    ./server/code       /var/www/simpleshelf
COPY    ./server/config     /opt/simpleshelf/config
COPY    ./node_modules      /var/www/simpleshelf/node_modules
COPY    ./output-public     /var/www/simpleshelf/output-public
# TODO: copy design docs, db default config docs

WORKDIR /var/www/simpleshelf

RUN     npm install -g pm2@latest

RUN     mkdir -p /var/log/pm2

EXPOSE 	8080

# Use config from ./config/server-process-config.json.
ENTRYPOINT ["pm2", "start", "/opt/simpleshelf/config/server-process-config.json", "--no-daemon"]
