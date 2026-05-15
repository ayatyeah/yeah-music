terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_security_group" "sre_demo" {
  name        = "yeahmusic-sre-demo"
  description = "Allow SSH and demo ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  ingress {
    from_port   = 3000
    to_port     = 9093
    protocol    = "tcp"
    cidr_blocks = [var.demo_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "node" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.ssh_key_name
  vpc_security_group_ids      = [aws_security_group.sre_demo.id]
  associate_public_ip_address = true

  tags = {
    Name = "yeahmusic-sre-node"
  }
}

output "public_ip" {
  value = aws_instance.node.public_ip
}

