variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "ami_id" {
  type        = string
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ssh_key_name" {
  type        = string
}

variable "ssh_cidr" {
  type        = string
}

variable "demo_cidr" {
  type        = string
}

