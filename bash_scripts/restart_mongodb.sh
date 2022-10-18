#!/bin/bash

cd /Users/jasonbeh/Desktop/code/custom-autoscalars/project/mongodb &&

helm upgrade --install my-release -f values.yaml bitnami/mongodb --namespace app &&

echo "Restarted mongodb"