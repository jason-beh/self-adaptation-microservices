#!/bin/bash

cd /Users/jasonbeh/Desktop/code/custom-autoscalars/project/nodejsapp &&

# eval $(minikube docker-env) && 

# docker build --no-cache -t jasonbeh19/nodejsapp . &&

# docker push jasonbeh19/nodejsapp &&

cd /Users/jasonbeh/Desktop/code/custom-autoscalars/project/nodejsapp/k8s &&

# kubectl delete -f . &&

kubectl apply -f . &&

echo "Dockerized and restarted nodejs app"


