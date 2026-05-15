FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY notification-service/package.json ./notification-service/package.json
RUN npm install --omit=dev --workspace @yeahmusic/notification-service
COPY common/src ./common/src
COPY notification-service/src ./notification-service/src
WORKDIR /app/notification-service
EXPOSE 4006
CMD ["npm","start"]

