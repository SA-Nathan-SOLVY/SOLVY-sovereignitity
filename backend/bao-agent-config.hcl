vault {
  address = "http://host.docker.internal:8200"
  retry {
    num_retries = 5
  }
}

auto_auth {
  method "approle" {
    config = {
      role_id_file_path = "/etc/bao/role-id"
      secret_id_file_path = "/etc/bao/secret-id"
      remove_secret_id_file_after_reading = false
    }
  }

  sink "file" {
    config = {
      path = "/tmp/bao-token"
    }
  }
}

template {
  destination = "/vault/secrets/stripe_api_key"
  contents = "{{- with secret \"secret/data/stripe/api_key\" -}}{{ .Data.data.key }}{{- end -}}"
  perms = "0600"
}
