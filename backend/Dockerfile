# ── build stage ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# DATABASE_URL only needed at runtime; dummy value lets prisma generate run.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npm run build

# ── runtime stage ──
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 4000
# Apply migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
