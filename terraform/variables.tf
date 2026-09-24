variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region for Artifact Registry and Cloud Run"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "uscis-api"
}

variable "artifact_repo_id" {
  description = "Artifact Registry repository ID for the container image"
  type        = string
  default     = "uscis-api"
}

variable "image_tag" {
  description = "Full image reference to deploy, e.g. us-central1-docker.pkg.dev/<project>/uscis-api/uscis-api:latest (build/push this with `gcloud builds submit` before applying)"
  type        = string
}

variable "domain" {
  description = "Custom domain mapped to the Cloud Run service"
  type        = string
  default     = "api.myusciscase.org"
}

variable "ui_origins" {
  description = "Cors:AllowedOrigins value: origins allowed to call the API cross-origin, wired to the Cloud Run service as indexed Cors__AllowedOrigins__N env vars"
  type        = list(string)
  default     = ["https://myusciscase.org", "https://www.myusciscase.org"]
}

variable "jwt_secret" {
  description = "JWT signing secret (stored in Secret Manager, not passed as a plain env var)"
  type        = string
  sensitive   = true
}

variable "db_connection_string" {
  description = "Postgres connection string for ConnectionStrings:CustomerConnection (stored in Secret Manager)"
  type        = string
  sensitive   = true
}

variable "jwt_issuer" {
  description = "Jwt:Issuer value"
  type        = string
  default     = "https://api.myusciscase.org"
}

variable "jwt_audience" {
  description = "Jwt:Audience value"
  type        = string
  default     = "https://myusciscase.org"
}

variable "google_oauth_client_id" {
  description = "Authentication:Google:ClientId value"
  type        = string
}

variable "oauth_client_id" {
  description = "OAuth:ClientId value (USCIS upstream API OAuth client id)"
  type        = string
}

variable "oauth_client_secret" {
  description = "OAuth:ClientSecret value (stored in Secret Manager, not passed as a plain env var)"
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend:ApiKey value (stored in Secret Manager, not passed as a plain env var)"
  type        = string
  sensitive   = true
}
