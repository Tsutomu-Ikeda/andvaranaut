resource "aws_s3_bucket" "andvaranaut_data" {
  bucket = "andvaranaut-data"
}

resource "aws_s3_bucket_versioning" "andvaranaut_data" {
  bucket = aws_s3_bucket.andvaranaut_data.bucket

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "andvaranaut_data_lifecycle" {
  depends_on = [aws_s3_bucket_versioning.andvaranaut_data]

  bucket = aws_s3_bucket.andvaranaut_data.bucket

  rule {
    id = "expire_noncurrent_version_object"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "andvaranaut_data" {
  bucket = aws_s3_bucket.andvaranaut_data.bucket
  acl    = "private"
}

resource "aws_s3_bucket" "andvaranaut_frontend" {
  bucket = "andvaranaut-frontend"
}

resource "aws_s3_bucket_website_configuration" "andvaranaut_frontend" {
  bucket = aws_s3_bucket.andvaranaut_frontend.bucket

  index_document {
    suffix = "index.html"
  }
}

resource "aws_cloudfront_origin_access_identity" "andvaranaut_origin_access_identity" {
  comment = "andvaranaut"
}

data "aws_iam_policy_document" "andvaranaut_frontend_policy" {
  statement {
    sid       = "Allow CloudFront GetObject"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.andvaranaut_frontend.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.andvaranaut_origin_access_identity.iam_arn]
    }
  }


  statement {
    sid       = "Allow CloudFront ListBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.andvaranaut_frontend.arn]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.andvaranaut_origin_access_identity.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "andvaranaut_frontend_policy" {
  bucket = aws_s3_bucket.andvaranaut_frontend.id
  policy = data.aws_iam_policy_document.andvaranaut_frontend_policy.json
}
