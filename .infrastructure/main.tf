terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"
}

resource "aws_cognito_user_pool_client" "paceme_webapp_client" {
  name = "paceme_webapp_client"
  callback_urls = ["http://localhost:3000/"]
  default_redirect_uri = "http://localhost:3000/"
  logout_urls = ["http://localhost:3000/"]
  allowed_oauth_flows = ["code"]
  explicit_auth_flows = ["USER_PASSWORD_AUTH"]

  user_pool_id = aws_cognito_user_pool.paceme_user_pool.id
}

resource "aws_cognito_user_pool_domain" "paceme_cognito_domain" {
  domain       = "pacemewebapp"
  user_pool_id = aws_cognito_user_pool.paceme_user_pool.id
}