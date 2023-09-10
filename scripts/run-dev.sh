#!/bin/bash

# Step 1: Build and run the Docker container
docker compose -f ../docker-dev.yml up --build $1


# Wait for a few seconds to ensure the container is fully up
sleep 5

# Step 2: Find the container ID of the running service
container_id=$(docker ps -qf "name=node-api-service")

# Step 3: Copy node_modules from the container to your local machine
if [ ! -z "$container_id" ]; then
  docker cp ${container_id}:/usr/src/app/node_modules ../api
  echo "Successfully copied node_modules to ../api ."
else
  echo "Could not find a running container with the name 'node-api-service'."
fi