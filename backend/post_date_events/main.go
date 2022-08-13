package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type ResponseBody struct {
	LastModified time.Time `json:"lastModified"`
	UnitPrice    int       `json:"unitPrice"`
}

func handle(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	username := request.RequestContext.Authorizer["claims"].(map[string]interface{})["cognito:username"].(string)

	awsSession := session.Must(session.NewSession())

	uploader := s3manager.NewUploader(awsSession)
	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(os.Getenv("AWS_S3_BUCKET_NAME")),
		Key:    aws.String(fmt.Sprintf("date-events/%s.json", username)),
		Body:   strings.NewReader(request.Body),
	})

	if err != nil {
		log.Fatal(err)
	}

	return events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body:       string("{\"status\": \"ok\"}"),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handle)
}
