#!/bin/bash

cd /Users/jasonbeh/Desktop/code/custom-autoscalars/project/bitnami &&

kubectl delete namespace bitnami-database &&

kubectl create namespace bitnami-database &&

helm install my-release -f values.yaml bitnami/mongodb --namespace bitnami-database &&

echo "Restarted mongodb"