variable "cognito_client_secret" {}

data "archive_file" "post_authenticate_zip" {
  type = "zip"

  source_dir  = "${local.lambdas_source_dir}/post_authenticate/bin"
  output_path = "${path.module}/gen/post_authenticate.zip"
}

resource "aws_lambda_function" "post_authenticate" {
  filename         = data.archive_file.post_authenticate_zip.output_path
  function_name    = "post_authenticate"
  role             = aws_iam_role.post_authenticate_lambda_exec.arn
  runtime          = "go1.x"
  handler          = "post_authenticate"
  source_code_hash = data.archive_file.post_authenticate_zip.output_base64sha256
  timeout          = "30"

  environment {
    variables = {
      AWS_S3_BUCKET_NAME = "${aws_s3_bucket.andvaranaut_data.id}"
      COGNITO_CLIENT_SECRET = var.cognito_client_secret
    }
  }
}

resource "aws_iam_role" "post_authenticate_lambda_exec" {
  name                = "post_authenticate_lambda"
  assume_role_policy  = data.aws_iam_policy_document.post_authenticate_lambda_exec.json
  # managed_policy_arns = [aws_iam_policy.post_authenticate_lambda_policy.arn, "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
}

data "aws_iam_policy_document" "post_authenticate_lambda_exec" {
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

# resource "aws_iam_policy" "post_authenticate_lambda_policy" {
#   name = "post_authenticate_lambda_policy"
#   policy = jsonencode({
#   })
# }

resource "aws_lambda_permission" "lambda_permission_post_authenticate" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_authenticate.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.andvaranaut.execution_arn}/*/*"
}
