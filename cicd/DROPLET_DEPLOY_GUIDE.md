# YeahMusic Droplet Deploy Guide

This guide is for deploying on a Ubuntu droplet with Docker Compose.

## 1) One-time server setup

```bash
sudo apt update
sudo apt install -y git curl ca-certificates

# Docker Engine + Compose plugin (Ubuntu 24.04)
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

Optional (run docker without sudo):

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Clone project on droplet

```bash
cd ~
git clone https://github.com/ayatyeah/yeah-music.git
cd yeah-music
```

If repo already exists:

```bash
cd ~/yeah-music
git fetch --all --prune
git checkout master
git pull origin master
```

## 3) Build and start stack

```bash
cd ~/yeah-music
docker compose down
docker compose up -d --build
```

## 4) Validate services

```bash
docker compose ps
docker compose logs --tail=80 api-gateway
docker compose logs --tail=80 music-service
docker compose logs --tail=80 auth-service
```

Health checks from droplet:

```bash
curl -fsS http://127.0.0.1:4010/healthz
curl -fsS http://127.0.0.1:4002/healthz
curl -fsS http://127.0.0.1:4001/healthz
```

## 5) Validate databases (now separated)

Project has 2 independent PostgreSQL containers:
- auth-db (accounts DB)
- music-db (tracks and playlists DB)

Check they are up:

```bash
docker compose ps auth-db music-db
```

Check DB list inside each container:

```bash
docker compose exec -T auth-db psql -U auth -d auth -c "\l"
docker compose exec -T music-db psql -U music -d music -c "\l"
```

## 6) Update to latest code (normal release flow)

```bash
cd ~/yeah-music
git pull origin master
docker compose down
docker compose up -d --build
```

## 7) Quick rollback if release is broken

Option A (if previous commit hash is known):

```bash
cd ~/yeah-music
git log --oneline -n 5
git checkout <PREVIOUS_COMMIT_HASH>
docker compose down
docker compose up -d --build
```

Option B (return to latest master):

```bash
cd ~/yeah-music
git checkout master
git pull origin master
docker compose down
docker compose up -d --build
```

## 8) GitHub Actions CD recommendations

Use manual deploy (`workflow_dispatch`) or deploy only after successful image build workflow.
Do not deploy on every push directly to production.

## 9) Optional: set up CI/CD SSH deploy target

Required GitHub secrets:
- SSH_PRIVATE_KEY
- SWARM_HOST
- SWARM_USER
- KUBE_CONFIG_DATA (for Kubernetes deploy workflow)

After secrets are set, run deploy workflows from Actions tab manually.
