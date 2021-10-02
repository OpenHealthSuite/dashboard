terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"
  default_tags {
    tags = {
      Project = "PaceMeApp"
    }
  }
}

module "api" {
    source = "./modules/api"
}

variable "domain" {
    type = string
    default = "app-dev.paceme.info"
}

resource "aws_acm_certificate" "frontend-certificate" {
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_zone" "paceme-public-zone" {
  name = var.domain
  comment = "${var.domain} public zone"
  provider = aws
}


resource "aws_route53_record" "paceme-cert-validation-record" {
  for_each = {
    for dvo in aws_acm_certificate.frontend-certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.paceme-public-zone.zone_id
}


resource "aws_acm_certificate_validation" "paceme-validation" {
  certificate_arn         = aws_acm_certificate.frontend-certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.paceme-cert-validation-record : record.fqdn]
}

module "webapp" {
    source = "./modules/webapp"
    certificate-arn = aws_acm_certificate_validation.paceme-validation.certificate_arn
}

resource "aws_route53_record" "paceme-frontend-cname" {
  allow_overwrite = true
  zone_id = aws_route53_zone.paceme-public-zone.zone_id
  name    = var.domain
  type    = "CNAME"
  ttl     = "1600"
  records = [module.webapp.distribution_domain_name]
}
