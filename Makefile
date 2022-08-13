include .env

build_frontend:
	cd frontend && yarn build

build_backend:
	cd backend/get_date_events && GOOS=linux GOARCH=amd64 go build -o bin/
	cd backend/post_date_events && GOOS=linux GOARCH=amd64 go build -o bin/
	cd backend/get_transit_information && GOOS=linux GOARCH=amd64 go build -o bin/

build:
	make build_backend && make build_frontend

deploy_frontend:
	export AWS_PROFILE=${AWS_PROFILE} && aws s3 sync --delete --size-only frontend/dist s3://andvaranaut-frontend/
	export AWS_PROFILE=$(AWS_PROFILE) && ./tools/upload_if_modified.sh index.html
	export AWS_PROFILE=$(AWS_PROFILE) && ./tools/upload_if_modified.sh robots.txt

deploy_backend:
	export AWS_PROFILE=${AWS_PROFILE} && \
		cd infra && terraform apply

deploy:
	make deploy_backend && make deploy_frontend

build_deploy:
	make build && make deploy
