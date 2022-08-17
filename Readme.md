# Command List

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