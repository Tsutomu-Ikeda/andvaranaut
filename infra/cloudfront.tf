locals {
  s3_origin_id          = "frontend-s3"
  api_gateway_origin_id = "backend-api-gateway-origin"
}

resource "aws_cloudfront_distribution" "andvaranaut" {
  origin {
    domain_name = aws_s3_bucket.andvaranaut_frontend.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.andvaranaut_origin_access_identity.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = trimprefix(aws_apigatewayv2_api.andvaranaut.api_endpoint, "https://")
    origin_id   = local.api_gateway_origin_id

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Andvaranaut"
  default_root_object = "index.html"

  aliases = ["andv.tomtsutom.com"]

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 60
    max_ttl                = 60
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.api_gateway_origin_id

    forwarded_values {
      query_string = true

      headers = [
        "Authorization",
      ]

      cookies {
        forward = "all"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["JP"]
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.all_tomtsutom.arn
    ssl_support_method  = "sni-only"
  }
}
