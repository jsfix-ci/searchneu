variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "us-east-1"
}

variable "cloudflare_zone_id" {
  description = "Zone ID of cloudflare"
}

variable "certificate_arn" {
  description = "ARN of the https cert granted by ACM"
}

variable "vpc_id" {
  description = "VPC to put the resources in"
}

variable "public_subnet_ids" {
  description = "Subnet IDs to put the load balancer in (should be public subnets)"
}

variable "private_subnet_ids" {
  description = "Subnet IDs to put the databases in (should be private subnets)"
}

variable "stage" {
  description = "Stage/environment. Should be prod or staging"
}

variable "domain" {
  description = "Domain name to deploy to and get https cert for"
}

variable "ecr_url" {
  description = "url of ecr repo for project image"
}

variable "secrets" {
  description = "secrets to pass as env variables"
  default = []
}

# Fargate
variable "app_port" {
  description = "port the webapp runs on"
  default = 5000
}

variable "app_count" {
  description = "number of app instances to run"
  default = 1
}

variable "webapp_cpu" {
  description = "cpu the webapp should get"
  default = 512
}

variable "webapp_memory" {
  description = "memory the webapp should get"
  default = 1024
}

variable "scrape_cpu" {
  description = "cpu the scrapers should get"
  default = 1024
}

variable "scrape_memory" {
  description = "memory the scrapers should get"
  default = 3072
}