docker start paceme-redis || docker run --name paceme-redis -d -p 6379:6379 redis:6.2.6
# Technically, we run cockroach, but it has the same protocol as PG 13
# postgresql://paceme:paceme@localhost:5432/paceme
docker start paceme-pg || docker run --name paceme-pg -e POSTGRES_USER=paceme -e POSTGRES_DB=paceme -e POSTGRES_PASSWORD=paceme -p 5432:5432 -d postgres:13