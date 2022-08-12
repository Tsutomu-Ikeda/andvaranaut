data "archive_file" "get_transit_information_zip" {
  type = "zip"

  source_dir  = "${local.lambdas_source_dir}/get_transit_information/bin"
  output_path = "${path.module}/gen/get_transit_information.zip"
}

resource "aws_lambda_function" "get_transit_information" {
  filename         = data.archive_file.get_transit_information_zip.output_path
  function_name    = "get_transit_information"
  role             = aws_iam_role.get_transit_information_lambda_exec.arn
  runtime          = "go1.x"
  handler          = "get_transit_information"
  source_code_hash = data.archive_file.get_transit_information_zip.output_base64sha256
  timeout          = "30"

  environment {
    variables = {
      AWS_S3_BUCKET_NAME = "${aws_s3_bucket.andvaranaut_data.id}"
    }
  }
}

resource "aws_iam_role" "get_transit_information_lambda_exec" {
  name                = "get_transit_information_lambda"
  assume_role_policy  = data.aws_iam_policy_document.get_transit_information_lambda_exec.json
  managed_policy_arns = [aws_iam_policy.get_transit_information_lambda_policy.arn, "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
}

data "aws_iam_policy_document" "get_transit_information_lambda_exec" {
  statement {
    sid     = "1"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "get_transit_information_lambda_policy" {
  name = "get_transit_information_lambda_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["s3:GetObject*"]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.andvaranaut_data.arn}/*"
      },
    ]
  })
}

resource "aws_lambda_permission" "lambda_permission_get_transit_information" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_transit_information.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.andvaranaut.execution_arn}/*/*"
}
