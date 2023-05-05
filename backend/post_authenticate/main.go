package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type AuthenticationResult struct {
	accessToken  string
	refreshToken string
}

func printWithMask(str string) {
	fmt.Printf("%s%s%s\n", str[0:2], strings.Repeat("*", len(str)-4), str[len(str)-2:])
}

func refresh(request events.APIGatewayProxyRequest) (*AuthenticationResult, error) {
	cookie := request.Headers["Cookie"]

	cookieParts := strings.Split(cookie, ";")
	var refreshToken string
	for _, cookiePart := range cookieParts {
		if strings.Contains(cookiePart, "refresh_token") {
			refreshToken = strings.Split(cookiePart, "=")[1]
		}
	}

	if refreshToken == "" {
		return nil, fmt.Errorf("code is empty")
	}

	printWithMask(refreshToken)

	clientSecret := os.Getenv("COGNITO_CLIENT_SECRET")
	req, err := http.NewRequest(
		"POST",
		"https://andv.auth.ap-northeast-1.amazoncognito.com/oauth2/token",
		strings.NewReader("grant_type=refresh_token&client_id=2ugimh4tmganbnn94kk1u6r4p3&client_secret="+clientSecret+"&refresh_token="+refreshToken+"&scope=email+openid+phone+profile"),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("status code is not 200")
	}

	var authResp map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return nil, err
	}

	accessToken := authResp["access_token"].(string)
	return &AuthenticationResult{accessToken: accessToken, refreshToken: refreshToken}, nil
}

func login(request events.APIGatewayProxyRequest) (*AuthenticationResult, error) {
	code := request.QueryStringParameters["code"]
	state := request.QueryStringParameters["state"]

	if code == "" || state == "" {
		return nil, fmt.Errorf("code / state is empty")
	}

	clientSecret := os.Getenv("COGNITO_CLIENT_SECRET")

	printWithMask(code)

	req, err := http.NewRequest(
		"POST",
		"https://andv.auth.ap-northeast-1.amazoncognito.com/oauth2/token",
		strings.NewReader("state="+state+"&grant_type=authorization_code&client_id=2ugimh4tmganbnn94kk1u6r4p3&client_secret="+clientSecret+"&code="+code+"&redirect_uri=https://andv.tomtsutom.com/login&scope=email+openid+phone+profile"),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		// 標準出力にログを出す
		fmt.Printf("%+v\n", resp)
		bufOfRequestBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("%+v\n", string(bufOfRequestBody))

		return nil, fmt.Errorf("status code is not 200")
	}

	var authResp map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return nil, err
	}

	accessToken := authResp["access_token"].(string)
	refreshToken := authResp["refresh_token"].(string)
	return &AuthenticationResult{accessToken: accessToken, refreshToken: refreshToken}, nil
}

func handle(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	authResult, err := login(request)

	if err != nil {
		authResult, err = refresh(request)
	}

	if err != nil {
		return events.APIGatewayProxyResponse{
			Headers: map[string]string{
				"Content-Type": "application/json",
				"Set-Cookie":   "refresh_token=; HttpOnly; Secure",
			},
			Body:       string("{\"status\": \"error\"}"),
			StatusCode: 400,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type": "application/json",
			"Set-Cookie": fmt.Sprintf(
				"refresh_token=%s; HttpOnly; Secure",
				authResult.refreshToken,
			),
		},
		Body:       string(fmt.Sprintf("{\"status\": \"ok\", \"access_token\": \"%s\"}", authResult.accessToken)),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handle)
}
