group "default" {
  targets = [
    "frontend",
    "auth-service",
    "music-service",
    "playlist-service",
    "upload-service",
    "analytics-service",
    "notification-service",
    "api-gateway"
  ]
}

target "frontend" {
  context = "./frontend"
  dockerfile = "Dockerfile"
  tags = ["yeahmusic/frontend:ci"]
}

target "auth-service" {
  context = "./backend"
  dockerfile = "auth-service/Dockerfile"
  tags = ["yeahmusic/auth-service:ci"]
}

target "music-service" {
  context = "./backend"
  dockerfile = "music-service/Dockerfile"
  tags = ["yeahmusic/music-service:ci"]
}

target "playlist-service" {
  context = "./backend"
  dockerfile = "playlist-service/Dockerfile"
  tags = ["yeahmusic/playlist-service:ci"]
}

target "upload-service" {
  context = "./backend"
  dockerfile = "upload-service/Dockerfile"
  tags = ["yeahmusic/upload-service:ci"]
}

target "analytics-service" {
  context = "./backend"
  dockerfile = "analytics-service/Dockerfile"
  tags = ["yeahmusic/analytics-service:ci"]
}

target "notification-service" {
  context = "./backend"
  dockerfile = "notification-service/Dockerfile"
  tags = ["yeahmusic/notification-service:ci"]
}

target "api-gateway" {
  context = "./backend"
  dockerfile = "api-gateway/Dockerfile"
  tags = ["yeahmusic/api-gateway:ci"]
}

