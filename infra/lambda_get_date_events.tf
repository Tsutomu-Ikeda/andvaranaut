data "archive_file" "get_date_events_zip" {
  type = "zip"

  source_dir  = "${local.lambdas_source_dir}/get_date_events/bin"
  output_path = "${path.module}/gen/get_date_events.zip"
}

resource "aws_lambda_function" "get_date_events" {
  filename         = data.archive_file.get_date_events_zip.output_path
  function_name    = "get_date_events"
  role             = aws_iam_role.get_date_events_lambda_exec.arn
  runtime          = "go1.x"
  handler          = "get_date_events"
  source_code_hash = data.archive_file.get_date_events_zip.output_base64sha256
  timeout          = "30"

  environment {
    variables = {
      AWS_S3_BUCKET_NAME = "${aws_s3_bucket.andvaranaut_data.id}"
    }
  }
}

resource "aws_iam_role" "get_date_events_lambda_exec" {
  name                = "get_date_events_lambda"
  assume_role_policy  = data.aws_iam_policy_document.get_date_events_lambda_exec.json
  managed_policy_arns = [aws_iam_policy.get_date_events_lambda_policy.arn, "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
}

data "aws_iam_policy_document" "get_date_events_lambda_exec" {
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

resource "aws_iam_policy" "get_date_events_lambda_policy" {
  name = "get_date_events_lambda_policy"
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

resource "aws_lambda_permission" "lambda_permission_get_date_events" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_date_events.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.andvaranaut.execution_arn}/*/*"
}
