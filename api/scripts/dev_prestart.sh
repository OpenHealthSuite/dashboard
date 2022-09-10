podman start paceme-redis || podman run --name paceme-redis -d -p 6379:6379 docker.io/redis:6.2.6
# postgresql://paceme:paceme@localhost:5432/paceme
# I always forget this, but the ports are HOST:CONTAINER
podman start paceme-pg || podman run --name paceme-pg -e POSTGRES_USER=paceme -e POSTGRES_DB=paceme -e POSTGRES_PASSWORD=paceme -p 2345:5432 -d docker.io/postgres:13