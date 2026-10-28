# syntax=docker/dockerfile:1
# -------------------------------------------------------------
# Stage 1: Build production React + TypeScript distribution
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Serve via lightweight enterprise Nginx Alpine
# -------------------------------------------------------------
FROM nginx:alpine

# Remove default nginx assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom reverse-proxy and SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
