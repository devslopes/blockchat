FROM node:carbon
WORKDIR /usr/blockchat
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]