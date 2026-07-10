# Uses the account's default VPC/subnet — no custom networking, to keep this
# a single, easy-to-reason-about EC2 instance rather than a multi-AZ setup.

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# GitHub Actions runners have no fixed IP, so SSH (22) has to stay open to
# 0.0.0.0/0 for the CD workflow to reach the box — mitigated by key-only auth
# (no password login on the AMI we use). Tighten with a bastion, AWS SSM
# Session Manager, or a self-hosted runner if that trade-off doesn't sit
# right for your use case.
resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg"
  description = "Allow HTTP, API, and SSH to the ${var.project_name} instance"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP (frontend)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "API (Swagger/direct access)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH (key-only auth)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}
