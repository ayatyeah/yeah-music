# PM-001 Simulated Service Failure

## Summary
- **What happened**: `upload-service` was intentionally degraded through `/admin/simulate-failure`.
- **Customer impact**: Upload requests returned HTTP 500 during the demo window; other services stayed available.
- **Start time**: Demo-controlled start time.
- **End time**: After the configured simulation duration or manual reset with `mode=none`.
- **Duration**: Demo duration is configurable (default 60s); validated run used 120s.
...
## Evidence
- Script: `platform/scripts/simulate-incident.ps1`
- Alerts: `monitoring/alerts/rules.yml`
- Runbook: `platform/sre/runbooks/RB-001-ServiceDown.md`
- Validation: traffic replay during incident returned HTTP 500 (20/20 requests).

## Root Cause
- **Primary cause**: Intentional service degradation for incident-response validation.
- **Contributing factors**: Short alert windows are used so the incident is visible during a live defense.

## Resolution & Recovery
- **What fixed it**: Reset failure mode to `none` or wait for `DurationSeconds` to expire, then verify `/healthz`, `/readyz`, and Grafana panels.
- **Time to mitigate**: Under one minute for the standard demo case.

## Action Items
- [x] Add runbook for service-down recovery.
- [x] Alert on simulated degradation and 5xx error rate.
- [x] Route Alertmanager webhook notifications to `notification-service`.
- [ ] Attach final defense screenshots from Grafana and Prometheus before PDF export.

## Evidence
- Script: `platform/scripts/simulate-incident.ps1`
- Alerts: `monitoring/alerts/rules.yml`
- Runbook: `platform/sre/runbooks/RB-001-ServiceDown.md`
