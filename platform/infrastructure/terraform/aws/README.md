## Terraform (AWS minimal template)

This is a **minimal, clean** Terraform template that provisions a single VM suitable for running Docker Swarm or a small Kubernetes (k3s) demo.

### Usage
```bash
cd platform/infrastructure/terraform/aws
terraform init
terraform apply \
  -var="ami_id=ami-xxxxxxxx" \
  -var="ssh_key_name=your-keypair"
```

Use the output `public_ip` as an Ansible inventory target.

