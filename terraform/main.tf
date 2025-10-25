terraform {
  required_providers {
    vultr = {
      source  = "vultr/vultr"
      version = "~> 2.0"
    }
  }
}

provider "vultr" {
  api_key = var.vultr_api_key
}

# Create a PostgreSQL managed database
resource "vultr_database" "payitforward_db" {
  database_engine         = "pg"
  database_engine_version = "15"
  region                  = var.region
  plan                    = var.database_plan
  label                   = "payitforward-postgres"

  # Trust all IPs (for demo - restrict in production)
  trusted_ips = ["0.0.0.0/0"]
}

# Create a compute instance for the backend API
resource "vultr_instance" "backend_server" {
  plan             = var.instance_plan
  region           = var.region
  os_id            = var.os_id
  label            = "payitforward-backend"
  hostname         = "payitforward-api"
  enable_ipv6      = true
  firewall_group_id = vultr_firewall_group.backend_firewall.id

  # User data to set up Node.js environment
  user_data = base64encode(<<-EOF
    #!/bin/bash

    # Update system
    apt-get update
    apt-get upgrade -y

    # Install Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs

    # Install PM2 for process management
    npm install -g pm2

    # Install git
    apt-get install -y git

    # Create app directory
    mkdir -p /opt/payitforward
    chown -R root:root /opt/payitforward

    # Install PostgreSQL client
    apt-get install -y postgresql-client

    echo "Server setup complete" > /root/setup-complete.txt
  EOF
  )
}

# Create firewall group for backend server
resource "vultr_firewall_group" "backend_firewall" {
  description = "PayItForward Backend Firewall"
}

# Allow HTTP traffic
resource "vultr_firewall_rule" "http" {
  firewall_group_id = vultr_firewall_group.backend_firewall.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = "0.0.0.0"
  subnet_size       = 0
  port              = "80"
  notes             = "Allow HTTP"
}

# Allow HTTPS traffic
resource "vultr_firewall_rule" "https" {
  firewall_group_id = vultr_firewall_group.backend_firewall.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = "0.0.0.0"
  subnet_size       = 0
  port              = "443"
  notes             = "Allow HTTPS"
}

# Allow SSH traffic
resource "vultr_firewall_rule" "ssh" {
  firewall_group_id = vultr_firewall_group.backend_firewall.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = "0.0.0.0"
  subnet_size       = 0
  port              = "22"
  notes             = "Allow SSH"
}

# Allow Node.js API port
resource "vultr_firewall_rule" "nodejs" {
  firewall_group_id = vultr_firewall_group.backend_firewall.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = "0.0.0.0"
  subnet_size       = 0
  port              = "3000"
  notes             = "Allow Node.js API"
}

# Outputs
output "database_host" {
  value       = vultr_database.payitforward_db.host
  description = "PostgreSQL database host"
}

output "database_port" {
  value       = vultr_database.payitforward_db.port
  description = "PostgreSQL database port"
}

output "database_username" {
  value       = vultr_database.payitforward_db.user
  description = "PostgreSQL database username"
  sensitive   = true
}

output "database_password" {
  value       = vultr_database.payitforward_db.password
  description = "PostgreSQL database password"
  sensitive   = true
}

output "database_name" {
  value       = vultr_database.payitforward_db.dbname
  description = "PostgreSQL database name"
}

output "backend_server_ip" {
  value       = vultr_instance.backend_server.main_ip
  description = "Backend server public IP address"
}

output "backend_server_ipv6" {
  value       = vultr_instance.backend_server.v6_main_ip
  description = "Backend server IPv6 address"
}

output "connection_string" {
  value       = "postgresql://${vultr_database.payitforward_db.user}:${vultr_database.payitforward_db.password}@${vultr_database.payitforward_db.host}:${vultr_database.payitforward_db.port}/${vultr_database.payitforward_db.dbname}"
  description = "Full PostgreSQL connection string"
  sensitive   = true
}
