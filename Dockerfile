FROM node:alpine
LABEL maintainer "siggame@mst.edu"

ARG NODE_ENV production
ENV NODE_ENV=${NODE_ENV}

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
RUN npm install --only=${NODE_ENV}

COPY . .

CMD ["npm", "run", "start"]