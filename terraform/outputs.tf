output "cloud_run_url" {
  description = "The *.run.app URL Cloud Run assigns the service"
  value       = google_cloud_run_v2_service.api.uri
}

output "domain_mapping_status" {
  description = "Resource records to create at the DNS host (Cloudflare) for the custom domain mapping"
  value       = google_cloud_run_domain_mapping.api.status
}
