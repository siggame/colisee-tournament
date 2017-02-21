#!/bin/bash

docker pull siggame/colisee-db:stable
docker rm --force tournament-db
docker run --name tournament-db --publish 5432:5432 --detach siggame/colisee-db:stable

npm run test

docker stop tournament-db
