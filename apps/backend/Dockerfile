FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm install
COPY . .
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["npm", "start"]