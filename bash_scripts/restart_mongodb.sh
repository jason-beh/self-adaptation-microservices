#!/bin/bash

cd /Users/jasonbeh/Desktop/code/custom-autoscalars/project/bitnami &&

helm install my-release -f values.yaml bitnami/mongodb --namespace app &&

echo "Restarted mongodb"