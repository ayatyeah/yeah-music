# End-to-End SRE Implementation — YeahMusic

Repository: https://github.com/ayatyeah/yeah-music.git

## Project Summary

This project implements Site Reliability Engineering practices across a distributed microservices application (8 services + frontend). The system demonstrates multi-orchestration (Docker Swarm & Kubernetes), infrastructure provisioning (Terraform), configuration management (Ansible), monitoring (Prometheus & Grafana), CI/CD (GitHub Actions), incident simulation and postmortem, and capacity planning.

## Architecture
- Microservices: `auth-service`, `api-gateway`, `music-service`, `playlist-service`, `upload-service`, `analytics-service`, `notification-service`, `frontend`.
- Datastores: PostgreSQL primary + replica (docker-compose & k8s manifests provided).
- Orchestration: Docker Compose / Swarm (top-level `docker-compose.yml`) and Kubernetes manifests under `platform/orchestration/kubernetes` (kustomize base).
- Provisioning: Terraform files in `platform/infrastructure/terraform` (AWS example).
- Configuration: Ansible playbook in `platform/infrastructure/ansible/playbook.yml`.
- Monitoring: Prometheus configs in `monitoring/prometheus`, Alertmanager in `monitoring/alertmanager`, Grafana provisioning in `monitoring/grafana`.

## SLIs / SLOs
- Availability SLO: 99% uptime
- Latency SLO: 95th percentile <= 200ms
- Error rate SLO: <= 1%

## CI/CD
Implemented GitHub Actions workflows:
- `.github/workflows/ci.yml` — per-service install + tests
- `.github/workflows/build-and-push.yml` — build images and push to GHCR
- `.github/workflows/deploy-k8s.yml` — update images in Kubernetes (requires `KUBE_CONFIG_DATA` secret)
- `.github/workflows/deploy-swarm.yml` — deploy stack to Swarm via SSH (requires `SSH_PRIVATE_KEY`, `SWARM_HOST`, `SWARM_USER`)

## Monitoring & Alerts
- Prometheus scrapes service metrics and alerting rules are in `monitoring/alerts/rules.yml`.
- Grafana dashboards are provisioned under `monitoring/grafana`.

## Incident Simulation
Planned scenario: `Order` (represented by `playlist-service` + `music-service` interactions) misconfigured DB connection leads to failure to create orders. Detection via increased error rates, alerts in Alertmanager, then root cause analysis and rollback/fix.

## Automation & Capacity
- Ansible playbook bootstraps nodes with Docker/Kubernetes and runs `docker compose up` for local demo.
- Terraform provisions an example AWS instance with security group rules.
- Autoscaling manifests exist in `platform/orchestration/kubernetes/base/autoscaling.yml`.

## Deliverables
1. Microservices source: repository (all services under `backend` and `frontend`).
2. Docker Compose / Swarm config: `docker-compose.yml`.
3. Kubernetes manifests: `platform/orchestration/kubernetes` (kustomize base).
4. Terraform: `platform/infrastructure/terraform`.
5. Ansible: `platform/infrastructure/ansible/playbook.yml`.
6. Monitoring: `monitoring/` folder (Prometheus, Alertmanager, Grafana provisioning).
7. CI/CD: `.github/workflows/` (added).
8. Incident report & postmortem: see `deliverables/postmortem.md` (to be completed after simulation).

---

For full details, runbook, screenshots and the PDF version of this report see the project deliverables in this repository.
