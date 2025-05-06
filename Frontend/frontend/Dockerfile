FROM node:18 AS build-stage

WORKDIR /app

COPY package*.json ./ 

RUN npm install

COPY . .

RUN npm run build --prod

RUN echo "Listing /app/dist contents:" && ls -la /app/dist
RUN echo "Listing /app/dist/frontend contents:" && ls -la /app/dist/frontend

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf 

COPY --from=build-stage /app/dist/frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]