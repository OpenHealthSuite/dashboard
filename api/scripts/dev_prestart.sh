docker start paceme-redis || docker run --name paceme-redis -d -p 6379:6379 redis:6.2.6
# postgresql://paceme:paceme@localhost:5432/paceme
# I always forget this, but the ports are HOST:CONTAINER
docker start paceme-pg || docker run --name paceme-pg -e POSTGRES_USER=paceme -e POSTGRES_DB=paceme -e POSTGRES_PASSWORD=paceme -p 2345:5432 -d postgres:13