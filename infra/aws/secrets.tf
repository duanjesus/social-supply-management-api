# Generated once at provision time and written only to the instance's .env
# (via user_data) and to local gitignored files for reference — never
# committed, never hardcoded like the docker-compose.yml dev defaults.

resource "random_password" "db_password" {
  length  = 24
  special = true
  # Keep the charset shell/.env-safe: no $, `, ", \, or newlines, which would
  # break interpolation in the .env file or the user_data shell script.
  override_special = "!#%^&*()-_=+[]{}<>:?"
}

resource "random_id" "jwt_secret" {
  byte_length = 32
}
