#!/bin/bash
aws deploy list-deployments \
              --application-name user-api-deployer \
              --deployment-group-name Gateway-api-deployment-group \
              --query 'deployments' \
              --max-items 1 \
              | sed 's/^"\(.*\)".*/\1/'
