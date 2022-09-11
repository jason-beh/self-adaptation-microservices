#!/bin/bash

helm uninstall custom-pod-autoscaler-operator -n bitnami-database

helm install --set mode=namespaced --namespace=bitnami-database custom-pod-autoscaler-operator https://github.com/jthomperoo/custom-pod-autoscaler-operator/releases/download/v1.3.0/custom-pod-autoscaler-operator-v1.3.0.tgz &&

cd /Users/jasonbeh/Desktop/code/custom-autoscalars/project/autoscaler &&

eval $(minikube docker-env) && 

docker build --no-cache -t jasonbeh19/k8s-metrics-cpu . &&

docker push jasonbeh19/k8s-metrics-cpu &&

kubectl apply -f cpa.yaml &&

echo "Dockerized and restarted autoscaler" 