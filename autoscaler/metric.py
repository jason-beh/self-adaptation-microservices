import json
import logging
import sys


def main():
    print(sys.stdin.read())
    # spec = json.loads(sys.stdin.read())
    # print(spec)
    # metric(spec)


def metric(spec):
    # Get CPU metrics
    cpu_metrics = spec["kubernetesMetrics"][0]
    current_replicas = cpu_metrics["current_replicas"]
    # cpu_resource = cpu_metrics["resource"]
    # cpu_pod_metrics_info = cpu_resource["pod_metrics_info"]

    # # Total up all of the pod cpu values
    # total_utilization = 0
    # for _, pod_info in cpu_pod_metrics_info.items():
    #     total_utilization += pod_info["Value"]

    # # Calculate the average utilization
    # average_utilization = total_utilization / current_replicas

    # # Get memory metrics
    # memory_metrics = spec["kubernetesMetrics"][1]
    # memory_resource = memory_metrics["resource"]
    # memory_pod_metrics_info = memory_resource["pod_metrics_info"]

    # # Total up all of the pod memory values
    # total_memory = 0
    # for _, pod_info in memory_pod_metrics_info.items():
    #     total_memory += pod_info["Value"]

    # # Calculate the average memory
    # average_memory = total_memory / current_replicas

    # "average_utilization": average_utilization,
    # "average_memory_value": average_memory

    # Generate JSON for evaluator
    sys.stdout.write(
        json.dumps(
            {
                "current_replicas": current_replicas,
                # "average_utilization": average_utilization,
            }
        )
    )


if __name__ == "__main__":
    main()
