# Self-Adaptation with Kubernetes
A brief example on how to utilise custom pod autoscalers to provide a more flexible approach in allowing our microservices to scale with Kubernetes, instead of the built-in Kubernetes HorizontalPodAutoscaler.

HPA only has one adaptation strategy that cannot be modified,
```
desiredReplicas = ceil[currentReplicas * ( currentMetricValue / desiredMetricValue )]
```

## Current Supported Metrics
| Metrics         | Condition to Scale Up |
|-----------------|-----------------------|
| CPU Utilisation |          > 50         |
| Average Memory  | > 13,000,000,000      |

## Future Metrics
Custom metrics from pod-level and resource-level, such as `requests-per-second` or `packets-per-second`.

## Command List

Prerequisites: minikube (for an easy setup)
```bash
minikube start
```

1. Pull operator yaml and apply the configuration
```bash 
kubectl apply -f https://github.com/jthomperoo/custom-pod-autoscaler-operator/releases/download/v1.3.0/cluster.yaml
```

2. Uses minikube docker
```bash
eval $(minikube docker-env)
```
3. Create Kubernetes deployment
```bash
kubectl apply -f deployment.yaml
```
4. Build image and delete the pod to ensure that we use the latest image version
```bash
docker build -t k8s-metrics-cpu .
kubectl delete pods k8s-metrics-cpu
```

5. Create Custom Pod Autoscaler
```bash
kubectl apply -f cpa.yaml
```

6. Create a mini load generating pod
```bash
kubectl run -it --rm load-generator --image=busybox -- /bin/sh
```
6a. Inside of pod's interactive environment, execute the following to generate load
```bash
while true; do wget -q -O- http://php-apache.default.svc.cluster.local; done
```

7. Using another terminal window, observe by typing in `metrics` or `evaluation` after running the command
```bash
kubectl exec -it k8s-metrics-cpu -- bash
```