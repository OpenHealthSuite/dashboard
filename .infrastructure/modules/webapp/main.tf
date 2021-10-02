

resource "aws_s3_bucket" "paceme_frontend_bucket" {
  bucket        = "pacemeapp-frontend"
  acl           = "private"
  force_destroy = true

}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "cloudfront origin access identity"
}

variable "certificate-arn" {
  type    = string
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.paceme_frontend_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = ["${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}"]
    }
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = ["${aws_s3_bucket.paceme_frontend_bucket.arn}"]

    principals {
      type        = "AWS"
      identifiers = ["${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}"]
    }
  }
}

resource "aws_s3_bucket_policy" "policy_for_cloudfront" {
  bucket = aws_s3_bucket.paceme_frontend_bucket.id
  policy = data.aws_iam_policy_document.s3_policy.json
}

resource "aws_cloudfront_distribution" "paceme_frontend_distribution" {
  enabled = true

  aliases = ["app-dev.paceme.info"]

  viewer_certificate {
    acm_certificate_arn = "arn:aws:acm:us-east-1:553904485373:certificate/1c2ffd4d-5d4a-43dd-89b6-ef4e2ad68099"
    ssl_support_method  = "sni-only"
  }

  comment             = ""
  default_root_object = "index.html"
  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
  }      
  price_class         = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US", "CA", "GB"]
    }
  }


  origin {
    domain_name = aws_s3_bucket.paceme_frontend_bucket.bucket_domain_name
    # just some unique ID of the origin
    origin_id = "s3_paceme_frontend_assets_origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3_paceme_frontend_assets_origin"
    compress         = true
    forwarded_values {
      query_string            = true
      query_string_cache_keys = ["v"]
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"

    # Time for which the files will be stored in cache (12h)
    min_ttl = 43200
    default_ttl = 43200
    max_ttl = 43200
  }
}

output "distribution_domain_name" {
  value = aws_cloudfront_distribution.paceme_frontend_distribution.domain_name
}