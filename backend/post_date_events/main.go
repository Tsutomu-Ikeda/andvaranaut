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
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
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
	LastModified time.Time `json:"lastModified"`
	UnitPrice    int       `json:"unitPrice"`
}

func toTime(yearMonth string) time.Time {
	parts := strings.Split(yearMonth, "-")

	year, _ := strconv.Atoi(parts[0])
	month, _ := strconv.Atoi(parts[1])
	currentMonthDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.FixedZone("JST", 9))
	currentMonthDate = currentMonthDate.AddDate(0, 0, -((int(currentMonthDate.Weekday()) + 6) % 7))

	return currentMonthDate
}

func toDateEventsObj(buf *bytes.Buffer) []DateEvent {
	var data []DateEvent

	if err := json.Unmarshal(buf.Bytes(), &data); err != nil {
		panic(err.Error())
	}
	return data
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
	existingData := toDateEventsObj(buf)
	requestData := toDateEventsObj(bytes.NewBufferString(request.Body))

	var result []DateEvent

	for _, v := range existingData {
		if v.Date.Before(toTime(currentMonth)) {
			result = append(result, v)
		}
	}

	result = append(result, requestData...)

	js, err := json.Marshal(result)

	if err != nil {
		panic(err.Error())
	}

	uploader := s3manager.NewUploader(awsSession)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(os.Getenv("AWS_S3_BUCKET_NAME")),
		Key:    aws.String(fmt.Sprintf("date-events/%s.json", username)),
		Body:   strings.NewReader(string(js)),
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
