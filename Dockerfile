FROM node:carbon
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
WORKDIR /usr/blockchat
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000 46656 46657

CMD [ "npm", "start" ]