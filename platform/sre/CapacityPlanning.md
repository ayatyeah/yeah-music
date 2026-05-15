# Capacity Planning

## Current Baseline
- Core stateless services run as multiple replicas in Swarm and Kubernetes where user traffic is expected.
- `music-service` and `api-gateway` define Kubernetes CPU and memory requests/limits.
- PostgreSQL is separated from stateless services and uses persistent volumes in Kubernetes.

## Expected Bottlenecks
- **API gateway**: Can become CPU-bound when proxying all user traffic.
- **Music service**: Reads from PostgreSQL and is sensitive to database latency.
- **PostgreSQL**: Primary storage is the main stateful bottleneck and needs backup, indexing, and storage monitoring.

## Scaling Strategy
- Horizontally scale stateless services with Swarm replicas or Kubernetes HPA.
- Keep `api-gateway` between 2 and 5 pods during normal load.
- Keep `music-service` between 2 and 6 pods during normal load.
- Increase PostgreSQL CPU/RAM and storage IOPS before increasing write-heavy traffic.
- Add database read replicas or caching if read latency exceeds the 200 ms p95 SLO.

## Signals To Watch
- p95 latency from `http_request_duration_seconds`.
- 5xx rate from `http_requests_total`.
- CPU and memory from container/node metrics.
- PostgreSQL connection count, disk usage, and query latency.

## Load Test Notes
- Start with steady traffic against `/music/tracks`, `/playlists`, and upload flows.
- Increase concurrency until p95 latency is above 200 ms or 5xx rate exceeds 1%.
- Record the saturation point and choose replica counts with at least 30% spare capacity.
