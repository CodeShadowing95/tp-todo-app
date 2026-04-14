# ---------- Base deps ----------
FROM node:20-alpine AS base
WORKDIR /app

# Dépendances utiles à certaines libs natives si besoin
RUN apk add --no-cache libc6-compat

# On copie uniquement les fichiers nécessaires au cache npm
COPY package*.json ./
RUN npm ci

# ---------- Development ----------
FROM node:20-alpine AS development
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Lancement en mode dev
CMD ["npm", "run", "dev"]

# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- Production ----------
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start"]