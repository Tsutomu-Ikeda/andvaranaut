package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type Event struct {
	Name      string `json:"name"`
	EventType string `json:"type"`
	Fare      int    `json:"fare,omitempty"`
	Amounts   int    `json:"amounts,omitempty"`
}

type DateEvent struct {
	Date       time.Time `json:"date"`
	Event      []Event   `json:"events"`
	WorkingDay bool      `json:"workingDay"`
}

type ResponseBody struct {
	DateEvents []DateEvent `json:"dateEvents"`
}

func handle(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	username := request.RequestContext.Authorizer["claims"].(map[string]interface{})["cognito:username"].(string)

	currentMonth := request.QueryStringParameters["currentMonth"]

	awsSession := session.Must(session.NewSession())

	svc := s3.New(awsSession)

	obj, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("AWS_S3_BUCKET_NAME")),
		Key:    aws.String(fmt.Sprintf("date-events/%s.json", username)),
	})
	if err != nil {
		log.Fatal(err)
	}

	rc := obj.Body
	defer rc.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(rc)

	var data []DateEvent
	var result []DateEvent

	if err := json.Unmarshal(buf.Bytes(), &data); err != nil {
		panic(err.Error())
	}

	parts := strings.Split(currentMonth, "-")

	year, _ := strconv.Atoi(parts[0])
	month, _ := strconv.Atoi(parts[1])
	currentMonthDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.FixedZone("JST", 9))
	currentMonthDate = currentMonthDate.AddDate(0, 0, -((int(currentMonthDate.Weekday()) + 6) % 7))

	for _, v := range data {
		if !v.Date.Before(currentMonthDate) {
			result = append(result, v)
		}
	}

	js, err := json.Marshal(result)

	if err != nil {
		panic(err.Error())
	}

	return events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body:       string(js),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handle)
}
