resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "app" {
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.ssh.public_key_openssh
}

# Private key never goes into git (see .gitignore in this directory) — it's
# written here so it can be read once to seed the GitHub Actions secret and
# for your own manual SSH access. Rotate the key pair if this file ever
# leaks (delete the aws_key_pair + tls_private_key resources and re-apply).
resource "local_sensitive_file" "ssh_private_key" {
  filename        = "${path.module}/generated/${var.project_name}-key.pem"
  content         = tls_private_key.ssh.private_key_pem
  file_permission = "0600"
}
