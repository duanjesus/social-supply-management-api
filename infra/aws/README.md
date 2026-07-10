# AWS deployment (Terraform)

Provisions a single EC2 instance running the full stack via Docker Compose — `db`, `api`, and `web` (nginx), same as local `docker compose up`. No load balancer, no managed RDS, no custom VPC: this is the cheapest, simplest thing that reliably serves the app on the public internet, appropriate for this project's scale. See the root [CLAUDE.md](../../CLAUDE.md) for the tradeoffs and why ECS/RDS wasn't the default.

## What gets created

| Resource | Purpose |
|---|---|
| 1× `aws_instance` (t3.micro, Ubuntu 24.04) | Runs Docker + the app via `docker compose up` |
| 1× `aws_eip` | Stable public IP (survives instance stop/start) |
| 1× `aws_security_group` | Opens 80 (web), 8080 (api/Swagger), 22 (SSH) |
| 1× `aws_key_pair` + generated SSH key | For manual troubleshooting and the GitHub Actions deploy step |
| `random_password` / `random_id` | Real DB password + JWT secret, written only to the instance's `.env` — never hardcoded, never committed |

Everything lives in the account's **default VPC** — no custom networking.

## One-time setup

```bash
cd infra/aws
terraform init
terraform apply
```

Requires AWS credentials in `~/.aws/credentials` (or env vars) for an IAM user/role with EC2 permissions. Takes a couple of minutes — cloud-init installs Docker and runs the first `docker compose up --build` on boot, so the app may take an extra minute or two to become reachable after `apply` finishes.

Outputs `app_url` (frontend), `api_url` (Swagger at `/swagger-ui.html`), and `ssh_command` for manual access.

## Redeploying

The GitHub Actions workflow (`.github/workflows/deploy.yml`) SSHes into the instance on every push to `main` and runs `git pull && docker compose up --build -d`. To deploy manually instead:

```bash
ssh -i generated/social-supply-key.pem ubuntu@<public_ip>
cd /opt/app && git pull && docker compose up --build -d
```

## Known limitations (deliberate, for this project's scale)

- **No HTTPS.** The app is served over plain HTTP on the Elastic IP — there's no domain name to issue a TLS certificate against. Point a domain at the Elastic IP and add Caddy/nginx + Let's Encrypt (or an ALB + ACM cert) if you need HTTPS.
- **No remote Terraform state.** State is a local `.tfstate` file (gitignored) on whichever machine ran `apply`. Fine for one operator; if more than one person needs to run Terraform, move to an S3 + DynamoDB backend.
- **SSH is open to `0.0.0.0/0`.** GitHub Actions runners don't have a fixed IP, so the security group can't be scoped to just them. Mitigated by key-only auth (no password login on the AMI). Tighten with AWS SSM Session Manager or a bastion if that trade-off doesn't sit right for your use case.
- **Single instance, no auto-scaling/self-healing beyond `restart: unless-stopped`.** If the instance itself dies, someone needs to notice and re-run `terraform apply`.

## If the API can't authenticate to Postgres ("password authentication failed")

Postgres's `POSTGRES_PASSWORD` only takes effect the **first** time it initializes an empty data directory — if the `doacoes-db-data` volume already exists (e.g. it was created by an earlier `.env`, or during troubleshooting), a later change to `DB_PASSWORD` in `.env` updates what the `api` container *sends*, not what's actually stored in Postgres, and auth fails. Since this deployment has no real user data worth preserving before you've started using it for real, the fix is to wipe and let it reinitialize against the current `.env`:

```bash
cd /opt/app
sudo docker compose down
sudo docker volume rm app_doacoes-db-data
sudo docker compose up -d
```

If there's real data you need to keep, change the password inside Postgres instead (`ALTER USER doacoes_user WITH PASSWORD '...'` via `docker exec -it doacoes-db psql -U doacoes_user -d doacoes_db`) rather than wiping the volume.

## Tearing down

```bash
terraform destroy
```

Deletes the instance, EIP, security group, and key pair. The Postgres data volume lives inside the instance's container storage, so it's gone too — there's no separate backup step here (see the limitations above).
