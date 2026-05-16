CI/CD workflows and required secrets

Workflows added:
- .github/workflows/ci.yml — per-service install and tests
- .github/workflows/build-and-push.yml — builds Docker images and pushes to GHCR
- .github/workflows/deploy-k8s.yml — updates images in a Kubernetes cluster
- .github/workflows/deploy-swarm.yml — deploys stack to Docker Swarm via SSH

Required repository secrets:
- `GITHUB_TOKEN` — provided by GitHub (used for GHCR login)
- `KUBE_CONFIG_DATA` — base64 of kubeconfig for the cluster (used by deploy-k8s workflow)
- `SSH_PRIVATE_KEY` — private key with access to Swarm manager (used by deploy-swarm)
- `SWARM_HOST` — hostname or IP of Swarm manager
- `SWARM_USER` — SSH user for Swarm manager

Notes:
- The deploy workflows assume the services' deployments exist in Kubernetes with names matching the job's set-image commands; adjust names/namespaces as needed.
- The build workflow pushes to `ghcr.io/<owner>/<service>:<sha>`; update tags if you use Docker Hub or another registry.
# CI/CD

Pipelines and automation scripts.
