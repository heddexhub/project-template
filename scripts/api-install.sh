#!/bin/bash

# Check if npm command is provided
if [ -z "$1" ]; then
  echo "Usage: ./api-install <npm-command>"
  exit 1
fi

# Step 1: Find the container ID of the running service
container_id=$(docker ps -qf "name=node-api-service")

# Step 2: Run the provided npm command inside the container
if [ ! -z "$container_id" ]; then
  docker exec -it ${container_id} $1
  echo "Successfully ran '$1' inside the container."
else
  echo "Could not find a running container with the name 'node-api-service'."
  exit 1
fi

# Step 3: Copy node_modules from the container to your local machine
docker cp ${container_id}:/usr/src/app/node_modules ../api
echo "Successfully copied node_modules to ../api."
