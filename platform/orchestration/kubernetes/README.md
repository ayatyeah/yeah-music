## Kubernetes (minimal manifests)

These manifests are designed to be **minimal and defense-friendly**.

### Apply
```bash
kubectl apply -f orchestration/kubernetes/base
```

### Images
The manifests reference images like `yeahmusic/auth-service:latest`.
Build and load them into your cluster (kind/minikube) before applying.

