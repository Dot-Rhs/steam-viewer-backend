FROM node:19
RUN npm install --global nodemon
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["./node_modules/.bin/nodemon", "server.js"]