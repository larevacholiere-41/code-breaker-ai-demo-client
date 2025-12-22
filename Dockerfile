FROM node:22
COPY . /app

WORKDIR /app
RUN yarn install
RUN yarn build

FROM nginx:1.27.1
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/dist /usr/share/nginx/html