include .env

build:
	cd backend/get_date_events && GOOS=linux GOARCH=amd64 go build -o bin/
	cd backend/get_transit_information && GOOS=linux GOARCH=amd64 go build -o bin/
	cd frontend && yarn build

deploy_frontend:
	export AWS_PROFILE=${AWS_PROFILE} && aws s3 sync frontend/dist s3://andvaranaut-frontend/

deploy_backend:
	export AWS_PROFILE=${AWS_PROFILE} && \
		cd infra && terraform apply

deploy:
	make deploy_backend && make deploy_frontend

build_deploy:
	make build && make deploy
