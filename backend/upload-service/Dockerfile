FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY upload-service/package.json ./upload-service/package.json
RUN npm ci --omit=dev --workspace @yeahmusic/upload-service
COPY common/src ./common/src
COPY upload-service/src ./upload-service/src
WORKDIR /app/upload-service
EXPOSE 4004
CMD ["npm","start"]

