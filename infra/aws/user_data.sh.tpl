#!/bin/bash
set -euxo pipefail

# --- swap: t3.micro has 1GB RAM, tight for JVM + Postgres + nginx together ---
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- docker ---
apt-get update -y
apt-get install -y docker.io docker-compose-v2 git
systemctl enable --now docker
usermod -aG docker ubuntu

# --- app ---
mkdir -p /opt/app
if [ ! -d /opt/app/.git ]; then
  git clone "${repo_url}" /opt/app
fi

cat > /opt/app/.env <<EOF
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
WEB_PORT=80
EOF
chmod 600 /opt/app/.env
chown -R ubuntu:ubuntu /opt/app

cd /opt/app
docker compose up --build -d
