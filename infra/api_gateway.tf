resource "aws_apigatewayv2_api" "andvaranaut" {
  name          = "andvaranaut"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_authorizer" "andvaranaut_auth" {
  api_id           = aws_apigatewayv2_api.andvaranaut.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = ["2ugimh4tmganbnn94kk1u6r4p3"]
    issuer   = "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_cI0NR7DZU"
  }
}

resource "aws_apigatewayv2_stage" "andvaranaut" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.andvaranaut_log_group.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      responseLatency         = "$context.responseLatency"
      integrationLatency      = "$context.integrationLatency"
      }
    )
  }
}

resource "aws_cloudwatch_log_group" "andvaranaut_log_group" {
  name              = "/aws/andvaranaut/api_gate_way_logs"
  retention_in_days = 30
}

resource "aws_apigatewayv2_integration" "get_date_events" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  integration_uri    = aws_lambda_function.get_date_events.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "post_date_events" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  integration_uri    = aws_lambda_function.post_date_events.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_transit_information" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  integration_uri    = aws_lambda_function.get_transit_information.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_date_events" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  route_key          = "GET /api/date_events"
  target             = "integrations/${aws_apigatewayv2_integration.get_date_events.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.andvaranaut_auth.id
}

resource "aws_apigatewayv2_route" "post_date_events" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  route_key          = "POST /api/date_events"
  target             = "integrations/${aws_apigatewayv2_integration.post_date_events.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.andvaranaut_auth.id
}

resource "aws_apigatewayv2_route" "get_transit_information" {
  api_id = aws_apigatewayv2_api.andvaranaut.id

  route_key          = "GET /api/transit_information"
  target             = "integrations/${aws_apigatewayv2_integration.get_transit_information.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.andvaranaut_auth.id
}
