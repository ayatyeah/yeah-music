# RB-001 ServiceDown

## Alert
`ServiceDown` (Prometheus `up == 0`)

## Impact
Requests to the affected service will fail or timeout. Depending on the dependency chain, this may partially degrade the user experience.

## Immediate actions
1. Check Grafana dashboard: **Targets up** panel.
2. Identify the service (`job`, `instance`).
3. Validate service locally:
   - `GET /healthz`
   - `GET /readyz`
4. If running via Compose/Swarm/K8s: restart the service.

## Recovery
- Compose: `docker compose restart <service>`
- Swarm: `docker service update --force <stack>_<service>`
- Kubernetes: `kubectl rollout restart deploy/<service>`

## Post-incident
- Record timeline and suspected root cause.
- Attach screenshots from Grafana/Prometheus (alert firing + recovery).

