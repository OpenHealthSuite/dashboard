FROM node:14

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3030

CMD npm start