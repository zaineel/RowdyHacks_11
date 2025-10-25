variable "vultr_api_key" {
  description = "Vultr API Key"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "Vultr region for resources"
  type        = string
  default     = "ewr" # Newark, NJ - closest to Texas
}

variable "database_plan" {
  description = "Database plan (vultr-dbaas-hobbyist-cc-1-25-1 for starter)"
  type        = string
  default     = "vultr-dbaas-hobbyist-cc-1-25-1"
}

variable "instance_plan" {
  description = "Compute instance plan"
  type        = string
  default     = "vc2-1c-2gb" # 1 vCPU, 2GB RAM
}

variable "os_id" {
  description = "Operating system ID (Ubuntu 22.04)"
  type        = number
  default     = 1743 # Ubuntu 22.04 LTS
}
