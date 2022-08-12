provider "aws" {}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

locals {
  lambdas_source_dir = "${path.module}/../backend/"
}
