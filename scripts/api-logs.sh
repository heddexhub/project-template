#!/bin/bash

# Step 1: Find the container ID of the running service
container_id=$(docker ps -qf "name=node-api-service")

# Step 3: Copy node_modules from the container to your local machine
if [ ! -z "$container_id" ]; then
  docker logs -f ${container_id} --follow
  echo "API logs follow :"
else
  echo "Could not find a running container with the name 'node-api-service'."
fi