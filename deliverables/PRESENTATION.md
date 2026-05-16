# YeahMusic — SRE Final Presentation

Slide 1 — Title
End-to-End SRE Implementation for a Distributed Microservices System

Slide 2 — Team & Repo
Repository: https://github.com/ayatyeah/yeah-music.git

Slide 3 — Objectives
- Deploy 6+ microservices
- Multi-orchestration: Docker Swarm & Kubernetes
- Terraform provisioning & Ansible automation
- Monitoring: Prometheus + Grafana
- CI/CD: GitHub Actions

Slide 4 — Architecture Diagram
- Frontend (Nginx) → API Gateway → Microservices → Postgres/Redis

Slide 5 — Orchestration
- Docker Compose / Swarm: `docker-compose.yml`
- Kubernetes: `platform/orchestration/kubernetes` (kustomize)

Slide 6 — Infra as Code
- Terraform: `platform/infrastructure/terraform`
- Ansible: `platform/infrastructure/ansible/playbook.yml`

Slide 7 — Monitoring
- Prometheus + Alertmanager + Grafana dashboards

Slide 8 — CI/CD
- Workflows: CI, build-and-push, deploy-k8s, deploy-swarm

Slide 9 — Incident Simulation & Postmortem
- Simulate DB misconfiguration on `playlist-service` → detect, analyze, fix, restore

Slide 10 — Capacity Planning
- Horizontal scaling for stateless services
- Database optimization and replica strategy

Slide 11 — Demo Steps
1. Run `docker compose up --build` (local demo)
2. Trigger CI and view artifact images in GHCR
3. Deploy to k8s using `kubectl apply -k platform/orchestration/kubernetes/base`

Slide 12 — Questions
- (Prepare answers for 3 defence questions)
