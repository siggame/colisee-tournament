FROM node:latest
LABEL maintainer "siggame@mst.edu"

ADD . tournament
WORKDIR tournament

RUN npm run setup
RUN npm run build

EXPOSE 22

CMD ["npm", "run", "quick-start"]
