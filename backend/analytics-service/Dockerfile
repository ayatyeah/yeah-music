FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY analytics-service/package.json ./analytics-service/package.json
RUN npm install --omit=dev --workspace @yeahmusic/analytics-service
COPY common/src ./common/src
COPY analytics-service/src ./analytics-service/src
WORKDIR /app/analytics-service
EXPOSE 4005
CMD ["npm","start"]

