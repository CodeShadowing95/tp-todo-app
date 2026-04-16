FROM node:20-alpine AS development

# Build context is the monorepo root
WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat

# Copy workspace manifests first for layer caching
COPY package*.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/config/tsconfig ./packages/config/tsconfig
COPY apps/backend/package.json ./apps/backend/

# Workspace-aware install: packages/db is resolved as a local symlink
RUN npm install

# Copy sources
COPY packages/db/ ./packages/db/
COPY packages/config/ ./packages/config/
COPY apps/backend/ ./apps/backend/

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=apps/backend"]
