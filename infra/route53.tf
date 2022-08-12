data "aws_acm_certificate" "all_tomtsutom" {
  domain   = "*.tomtsutom.com"
  provider = aws.virginia
  statuses = ["ISSUED"]
}

resource "aws_route53_record" "andvaranaut_tomtsutom" {
  name    = "andv.tomtsutom.com"
  type    = "A"
  zone_id = "Z05475632TIZ9ZA35NIVN"

  alias {
    name                   = aws_cloudfront_distribution.andvaranaut.domain_name
    zone_id                = aws_cloudfront_distribution.andvaranaut.hosted_zone_id
    evaluate_target_health = false
  }
}
