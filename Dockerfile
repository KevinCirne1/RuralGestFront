FROM node:24.11.1-alpine AS build

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY . /app/

RUN npm run build

FROM nginx:1.29.3-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]