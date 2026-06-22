FROM node:20-alpine AS development

WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/config/tsconfig ./packages/config/tsconfig
COPY apps/auth/package.json ./apps/auth/

RUN npm install

COPY packages/db/ ./packages/db/
COPY packages/config/ ./packages/config/
COPY apps/auth/ ./apps/auth/

RUN npm run build --workspace=db

EXPOSE 3001

CMD ["npm", "run", "dev", "--workspace=apps/auth"]
