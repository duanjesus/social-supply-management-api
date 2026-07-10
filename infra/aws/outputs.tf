output "public_ip" {
  description = "Stable public IP of the app instance (Elastic IP)."
  value       = aws_eip.app.public_ip
}

output "ssh_command" {
  description = "How to SSH into the instance for manual troubleshooting."
  value       = "ssh -i ${local_sensitive_file.ssh_private_key.filename} ubuntu@${aws_eip.app.public_ip}"
}

output "app_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "api_url" {
  value = "http://${aws_eip.app.public_ip}:8080"
}

output "ssh_private_key_path" {
  description = "Local path to the generated SSH private key (gitignored) — needed for the GH_EC2_SSH_KEY GitHub secret."
  value       = local_sensitive_file.ssh_private_key.filename
}
