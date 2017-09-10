FROM node:alpine
LABEL maintainer "siggame@mst.edu"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]