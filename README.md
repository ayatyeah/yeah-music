# YeahMusic SRE

This repository contains a minimal **distributed microservices demo** with **SRE practices**:
metrics, dashboards, alerting, and incident simulation.

- frontend: Vite React app
- backend: 6+ Node/Express microservices + API gateway
- monitoring: Prometheus + Grafana + Alertmanager (working configs)
- platform: orchestration (Compose/Swarm/K8s), infrastructure (Terraform/Ansible), SRE, scripts, docs, and database assets

## Quick start (Compose)
Prereqs: Docker Desktop (daemon running).

1. Start stack:
   - `docker compose up -d --build`
2. Open:
  - Frontend (dev): `http://localhost:5173`
  - Frontend (nginx 80): `http://localhost:80`
  - API Gateway: `http://localhost:4010`
  - Prometheus: `http://localhost:9091`
  - Grafana: `http://localhost:3002` (admin/admin)
  - Alertmanager: `http://localhost:9093`

## Incident simulation (defense demo)
Trigger a failure on a service (example: upload-service):
- PowerShell:
  - `./platform/scripts/simulate-incident.ps1 -ServiceUrl http://localhost:4004 -Mode error -DurationSeconds 60`

What you should see:
- Prometheus alert `SimulatedIncidentActive`
- Possibly `High5xxRate` for the degraded service
- Alertmanager sends a webhook to `notification-service`
- Check received alerts:
  - `GET http://localhost:4006/alerts`

## SLI/SLO
See `platform/sre/SLO.md`.

## Storage boundaries (PostgreSQL)
- `auth-db` stores users, credentials, roles, and JWT-owned identity data.
- `music-db` stores tracks and playlists.
- There are no cross-database foreign keys; services link ownership only by user UUID.
- Audio files are stored outside PostgreSQL, through Docker volumes/static serving.


