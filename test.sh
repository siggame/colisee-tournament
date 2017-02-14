#!/bin/bash

docker pull siggame/colisee-db
docker rm --force tournament-db
docker run --name tournament-db --publish 5432:5432 --detach siggame/colisee-db

npm run test

docker stop tournament-db
