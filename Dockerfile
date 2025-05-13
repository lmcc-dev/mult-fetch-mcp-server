# syntax=docker/dockerfile:1

# Base image for Node.js
ARG NODE_VERSION=18
ARG PNPM_VERSION=8.6.0

FROM node:${NODE_VERSION} AS base

# Update Corepack and enable pnpm
RUN npm install --global corepack@latest && corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Set working directory
WORKDIR /app

# Builder stage for dependencies and build
FROM base AS builder

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install --frozen-lockfile

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript project
RUN pnpm run build

# Production stage
FROM node:${NODE_VERSION}-slim AS final

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Set working directory
WORKDIR /app

# Copy built files and necessary dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]