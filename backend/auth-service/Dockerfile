FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY common/package.json ./common/package.json
COPY auth-service/package.json ./auth-service/package.json
RUN npm install --omit=dev --workspace @yeahmusic/auth-service
COPY common/src ./common/src
COPY auth-service/src ./auth-service/src
WORKDIR /app/auth-service
EXPOSE 4001
CMD ["npm","start"]

