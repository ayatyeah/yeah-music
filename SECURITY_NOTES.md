# 🔒 Security Configuration - Ports Access

## Local Development (Docker Compose)

All ports are bound to `127.0.0.1` (localhost only). This means:
- ✅ You can access from your machine: `http://localhost:3001`
- ❌ Others CANNOT access from external networks
- ✅ Secure for development

## AWS Deployment (Terraform)

Two security groups variables control access:

### 1. SSH Access
```hcl
variable "ssh_cidr" {
  description = "Your IP address for SSH access"
  default     = "0.0.0.0/0"  # Change to your IP!
}
```

**To restrict to YOUR IP only:**
```bash
terraform plan -var="ssh_cidr=192.168.1.100/32"
terraform apply -var="ssh_cidr=192.168.1.100/32"
```

### 2. Demo Ports Access (3000-9093)
```hcl
variable "demo_cidr" {
  description = "Your IP address for demo ports"
  default     = "0.0.0.0/0"  # Change to your IP!
}
```

**To restrict to YOUR IP only:**
```bash
terraform plan -var="demo_cidr=192.168.1.100/32"
terraform apply -var="demo_cidr=192.168.1.100/32"
```

---

## 🔍 Find Your Public IP

```bash
# Linux/Mac
curl ifconfig.me

# Windows PowerShell
(Invoke-WebRequest -Uri "https://ifconfig.me/").Content

# Online
https://ifconfig.me/
https://whatismyipaddress.com/
```

---

## 📝 Usage Example

Replace `YOUR_IP` with your actual IP (e.g., `203.0.113.45/32`):

```bash
cd platform/infrastructure/terraform/aws

terraform init

terraform plan \
  -var="ssh_cidr=YOUR_IP/32" \
  -var="demo_cidr=YOUR_IP/32" \
  -var="ami_id=ami-0c55b159cbfafe1f0" \
  -var="ssh_key_name=your-key-name"

terraform apply \
  -var="ssh_cidr=YOUR_IP/32" \
  -var="demo_cidr=YOUR_IP/32" \
  -var="ami_id=ami-0c55b159cbfafe1f0" \
  -var="ssh_key_name=your-key-name"
```

---

## ✅ Ports Status

| Environment | Local | AWS |
|---|---|---|
| All ports | 127.0.0.1 only | YOUR_IP/32 |
| External access | ❌ Blocked | ❌ Blocked (unless YOUR_IP) |
| Security | ✅ Secure | ✅ Secure |

