FROM devslopes/ubuntu-node:latest

COPY package*.json ./
RUN npm install

EXPOSE 3000 46656 46657

CMD [ "npm", "start" ]
