FROM 		node:latest

LABEL author="Andrew Ittner"

WORKDIR /var/www/simpleshelf

RUN npm install -g pm2@latest

RUN mkdir -p /var/log/pm2

EXPOSE 		8080

# Use config from ./config/server-config.json.
ENTRYPOINT ["pm2", "start", "/opt/simpleshelf/config/server-config.json", "--no-daemon"]

# To build:
# docker build -f node-front.dockerfile --tag node_front ../

# To run:
# docker run -d -p 8080:8080 -v $(PWD):/var/www/simpleshelf -w /var/www/simpleshelf node_front
# docker run -d -p 8080:8080 --name node_front node_front 