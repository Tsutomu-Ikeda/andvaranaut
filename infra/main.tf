provider "aws" {}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

locals {
  lambdas_source_dir = "${path.module}/../backend/"
}

terraform {
  required_version = "1.2.6"

  backend "s3" {
    bucket = "tomtsutom-infra"
    key    = "andvaranaut/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
