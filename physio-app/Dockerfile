# Stage 1: Build Angular
FROM node:20-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build --configuration=production --no-prerender

# Stage 2: Serve Nginx
FROM nginx:alpine
COPY --from=build /app/dist/physio-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]