podman start paceme-redis || podman run --name paceme-redis -d -p 6379:6379 docker.io/redis:6.2.6
# I always forget this, but the ports are HOST:CONTAINER
podman start paceme-cassandra || podman run --name paceme-cassandra \
    -e CASSANDRA_CLUSTER_NAME="PaceMe Test Cluster" \
    -p 9343:9042 \
    -d \
    docker.io/cassandra