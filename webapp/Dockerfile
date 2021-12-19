FROM node:16.13.1

# Note: This dockerfile is basically just for bringing it up in a stack.
# In reality, just serve the damn static files

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD npm run start