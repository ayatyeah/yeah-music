variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "ami_id" {
  type        = string
  description = "Ubuntu/Debian AMI id"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ssh_key_name" {
  type        = string
  description = "Existing EC2 key pair name"
}

variable "ssh_cidr" {
  type        = string
  description = "Your IP address for SSH access (e.g., 192.168.1.100/32)"
  default     = "0.0.0.0/0"
}

variable "demo_cidr" {
  type        = string
  description = "Your IP address for demo ports (e.g., 192.168.1.100/32)"
  default     = "0.0.0.0/0"
}

