FROM node:12.18.2 as build
LABEL maintainer = "Chakshu Gautam"
LABEL maintainer_email = "chakshu@samagragovernance.in"
USER root
RUN npm install -g yarn --force
RUN yarn cache clean
COPY src /opt/uci
WORKDIR /opt/uci
RUN yarn -i
CMD ["node", "app.js", "&"]