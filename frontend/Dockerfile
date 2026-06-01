# ── build stage ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# Same-origin URLs: nginx proxies /api and /socket.io to the backend.
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_SOCKET_URL=
RUN npm run build

# ── serve stage ──
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
