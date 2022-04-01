docker start paceme-redis || docker run --name paceme-redis -d -p 6379:6379 redis:6.2.6
docker start paceme-mongo || docker run --name paceme-mongo -d -p 27017:27017 mongo:4.4.13