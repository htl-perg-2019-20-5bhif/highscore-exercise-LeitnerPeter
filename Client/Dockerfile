FROM node:latest as build

ENV PORT 80
EXPOSE 80

COPY . /app

WORKDIR /app

RUN npm install
RUN npm run build

FROM nginx:alpine
COPY /app/dist/ /usr/share/nginx/html/