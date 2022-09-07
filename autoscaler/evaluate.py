import json
import logging
import sys

TARGET_AVERAGE_UTILIZATION = 70

def main():
    spec = json.loads(sys.stdin.read())
    print(spec)
    evaluate(spec)


def evaluate(spec):
    # Only expect 1 metric provided
    if len(spec["metrics"]) != 1:
        sys.stderr.write("Expected 1 metric")
        exit(1)

    metric_value = json.loads(spec["metrics"][0]["value"])
    current_replicas = metric_value["current_replicas"]
    average_utilization = metric_value["average_utilization"]
    # average_memory = metric_value["average_memory"]

    # Calculate target replicas, increase by 1 if utilization is above target, decrease by 1 if utilization is below
    # target
    target_replicas = current_replicas
    if average_utilization > TARGET_AVERAGE_UTILIZATION:
        target_replicas += 1
    else:
        target_replicas -= 1

    # Build JSON dict with targetReplicas
    evaluation = {}
    evaluation["targetReplicas"] = target_replicas

    # Output JSON to stdout
    sys.stdout.write(json.dumps(evaluation))


if __name__ == "__main__":
    main()
