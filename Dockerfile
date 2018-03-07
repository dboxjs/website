FROM node:boron
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ONBUILD RUN npm install -g npm
RUN npm install -g @angular/cli
RUN ng set --global packageManager=yarn
