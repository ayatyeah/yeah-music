FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY api-gateway/package.json ./api-gateway/package.json
RUN npm ci --omit=dev --workspace @yeahmusic/api-gateway
COPY common/src ./common/src
COPY api-gateway/src ./api-gateway/src
WORKDIR /app/api-gateway
EXPOSE 4010
CMD ["npm","start"]

