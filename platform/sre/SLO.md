# SLI/SLO

This project exposes Prometheus metrics from each service at `/metrics`.

## SLIs
- **Availability**: `up` per target
- **Latency**: `http_request_duration_seconds` histogram
- **Error rate**: `http_requests_total{status_code=~"5.."}` / `http_requests_total`
- **Request success rate**: `http_requests_total{status_code!~"5.."}` / `http_requests_total`

## SLO Targets
- **Availability**: >= 99.0% (monthly)
- **Latency (p95)**: <= 200ms (rolling 5m for demo)
- **Error rate**: <= 1% (rolling 5m for demo)
- **Request success rate**: >= 99% (rolling 5m for demo)

## Notes (defense-friendly)
- For the demo, alerting is tuned aggressively (seconds/minutes) so you can show incidents live.
- For a real SRE program, these windows are typically much larger (minutes/hours/days).
