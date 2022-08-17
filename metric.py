import json
import logging
import sys

def main():
    spec = json.loads(sys.stdin.read())
    print("Test")
    print(spec)
    # logging.info(spec)
    metric(spec)

def metric(spec):
    cpu_metrics = spec["kubernetesMetrics"][0]
    current_replicas = cpu_metrics["current_replicas"]
    resource = cpu_metrics["resource"]
    pod_metrics_info = resource["pod_metrics_info"]

    # Total up all of the pod values
    total_utilization = 0
    for _, pod_info in pod_metrics_info.items():
        total_utilization += pod_info["Value"]

    # Calculate the average utilization
    average_utilization = total_utilization / current_replicas

    # Generate JSON for evaluator
    sys.stdout.write(json.dumps(
        {
            "current_replicas": current_replicas,
            "average_utilization": average_utilization
        }
    ))

if __name__ == "__main__":
    main()
