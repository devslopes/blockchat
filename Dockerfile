FROM node:carbon
WORKDIR /usr/blockchat
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

ENV port=3000

EXPOSE $port

CMD [ "npm", "start" ]