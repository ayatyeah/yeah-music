FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY playlist-service/package.json ./playlist-service/package.json
RUN npm install --omit=dev --workspace @yeahmusic/playlist-service
COPY common/src ./common/src
COPY playlist-service/src ./playlist-service/src
WORKDIR /app/playlist-service
EXPOSE 4003
CMD ["npm","start"]

