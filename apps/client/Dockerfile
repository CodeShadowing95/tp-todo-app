FROM node:20-alpine AS development

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Build args for Vite proxy configuration
ARG VITE_PROXY_TARGET=http://localhost:3000
ENV VITE_PROXY_TARGET=${VITE_PROXY_TARGET}

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
