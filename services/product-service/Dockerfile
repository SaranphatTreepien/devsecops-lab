# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --production

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY index.js .
EXPOSE 3000
CMD ["node", "index.js"]