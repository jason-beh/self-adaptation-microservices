# Self-Adaptation with Kubernetes

A brief example on how to utilise custom pod autoscalers to provide a more flexible approach in allowing our microservices to scale with Kubernetes, instead of the built-in Kubernetes HorizontalPodAutoscaler.

HPA only has one adaptation strategy that cannot be modified,
```
desiredReplicas = ceil[currentReplicas * ( currentMetricValue / desiredMetricValue )]
```

## Case Study

Inspired by a real world problem, we will be building the system that reveals a typical university's Results Day, where huge amount of traffic will spike up in a small interval. Our web application and database should be able to scale horizontally and adapt to such situations.

Tech Stack
- Node.js (Express)
- MongoDB

## Adaptation Goals

To Be Updated

## Architecture Diagram

![Architecture Diagram](./repo/architecture.png)

## Installation Steps

To Be Updated