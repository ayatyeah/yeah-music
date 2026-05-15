FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY music-service/package.json ./music-service/package.json
RUN npm install --omit=dev --workspace @yeahmusic/music-service
COPY common/src ./common/src
COPY music-service/src ./music-service/src
WORKDIR /app/music-service
EXPOSE 4002
CMD ["npm","start"]

