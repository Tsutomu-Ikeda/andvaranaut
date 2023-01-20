include .env

build_frontend:
	git stash --include-untracked
	cd frontend && yarn build
	git stash pop || :

build_backend:
	git stash --include-untracked
	cd backend/get_date_events && GOOS=linux GOARCH=amd64 go build -o bin/
	cd backend/post_date_events && GOOS=linux GOARCH=amd64 go build -o bin/
	cd backend/get_transit_information && GOOS=linux GOARCH=amd64 go build -o bin/
	git stash pop || :

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

pull_data:
	export AWS_PROFILE=${AWS_PROFILE} && aws s3 cp s3://andvaranaut-data/date-events/5ad3f64a-761c-4dc6-ab56-852e56238039.json backend/data/dateEvents.json

push_data:
	export AWS_PROFILE=${AWS_PROFILE} && aws s3 cp backend/data/dateEvents.json s3://andvaranaut-data/date-events/5ad3f64a-761c-4dc6-ab56-852e56238039.json
