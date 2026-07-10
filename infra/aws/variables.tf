variable "aws_region" {
  description = "AWS region to deploy into. sa-east-1 (São Paulo) by default for lowest latency to Brazilian users."
  type        = string
  default     = "sa-east-1"
}

variable "instance_type" {
  description = "EC2 instance type. t3.micro is free-tier eligible; bump to t3.small if the JVM+Postgres combo is tight on 1GB RAM."
  type        = string
  default     = "t3.micro"
}

variable "project_name" {
  description = "Prefix used to name/tag every resource this module creates."
  type        = string
  default     = "social-supply"
}

variable "repo_url" {
  description = "Public HTTPS URL of the git repository to clone onto the instance."
  type        = string
  default     = "https://github.com/duanjesus/social-supply-management-api.git"
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into the instance. Defaults to the machine running `terraform apply`'s current public IP (see data.http.my_ip) — override if that's not the right source (e.g. GitHub Actions runners have no fixed IP)."
  type        = string
  default     = null
}
