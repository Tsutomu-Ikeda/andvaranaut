package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type ResponseBody struct {
	LastModified time.Time `json:"lastModified"`
	UnitPrice    int       `json:"unitPrice"`
}

func handle(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	username := request.RequestContext.Authorizer["claims"].(map[string]interface{})["cognito:username"].(string)

	awsSession := session.Must(session.NewSession())

	svc := s3.New(awsSession)

	obj, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("AWS_S3_BUCKET_NAME")),
		Key:    aws.String(fmt.Sprintf("transit-informations/%s.json", username)),
	})
	if err != nil {
		log.Fatal(err)
	}

	rc := obj.Body
	defer rc.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(rc)

	return events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body:       string(buf.String()),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handle)
}