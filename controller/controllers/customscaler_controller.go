/*
Copyright 2022.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-logr/logr"
	kapps "k8s.io/api/apps/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	jasonbehappv1 "jasonbeh.com/custom-scaler/api/v1"
)

// CustomScalerReconciler reconciles a CustomScaler object
type CustomScalerReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=jasonbehapp.jasonbeh.com,namespace=ingress-nginx,resources=customscalers,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=jasonbehapp.jasonbeh.com,namespace=ingress-nginx,resources=customscalers/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=jasonbehapp.jasonbeh.com,namespace=ingress-nginx,resources=customscalers/finalizers,verbs=update

// Manage deployments
//+kubebuilder:rbac:groups=apps,namespace=ingress-nginx,resources=deployments,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=apps,namespace=ingress-nginx,resources=deployments/status,verbs=get

// Manage statefulsets
//+kubebuilder:rbac:groups=apps,namespace=ingress-nginx,resources=statefulsets,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=apps,namespace=ingress-nginx,resources=statefulsets/status,verbs=get

const MIN_CONNECTIONS_PER_POD = 20
const MAX_CONNECTIONS_PER_POD = 100

const MIN_MEMORY_USAGE_MB = 340
const MAX_MEMORY_USAGE_MB = 380

const MIN_CPU_USAGE_SECONDS = 0.003
const MAX_CPU_USAGE_SECONDS = 0.005

const MIN_ERROR_RATE = 0.0
const MAX_ERROR_RATE = 0.3

func getFormattedResults(url string) []interface{} {
	url_with_time := url + fmt.Sprint(time.Now().Unix())

	resp, err := http.Get(url_with_time)
	if err != nil {
		log.Fatalln(err)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}

	var raw_data map[string]interface{}
	if err := json.Unmarshal(body, &raw_data); err != nil {
		panic(err)
	}

	data := raw_data["data"].(map[string]interface{})

	result := data["result"].([]interface{})

	return result
}

func evaluate_active_connections(replicas int32) int {
	results := getFormattedResults("http://localhost:9090/api/v1/query?query=sum%28avg_over_time%28nginx_ingress_controller_nginx_process_connections%7Bstate%3D%22active%22%7D%5B2m%5D%29%29&time=")

	for _, r := range results {
		node := r.(map[string]interface{})
		value := node["value"].([]interface{})

		if value[1] != "NaN" {
			connections, err := strconv.Atoi(value[1].(string))
			if err != nil {
				panic(err)
			}

			connections_per_pod := int32(connections) / replicas

			fmt.Println("Connections Per Pod: " + string(connections_per_pod))

			if connections_per_pod > MAX_CONNECTIONS_PER_POD {
				return 1
			} else if connections_per_pod < MIN_CONNECTIONS_PER_POD {
				return -1
			}
		}
	}

	return 0
}

func evaluate_memory() int {
	results := getFormattedResults("http://localhost:9090/api/v1/query?query=avg%28nginx_ingress_controller_nginx_process_resident_memory_bytes%29+&time=")

	for _, r := range results {
		node := r.(map[string]interface{})
		value := node["value"].([]interface{})

		if value[1] != "NaN" {
			memory_bits, err := strconv.Atoi(value[1].(string))
			if err != nil {
				panic(err)
			}

			memory_megabytes := memory_bits / (1024 * 1024)

			fmt.Println(fmt.Sprint("memory_megabytes: ", memory_megabytes))

			if memory_megabytes > MAX_MEMORY_USAGE_MB {
				return 1
			} else if memory_megabytes < MIN_MEMORY_USAGE_MB {
				return -1
			}
		}
	}

	return 0
}

func evaluate_cpu() int {
	results := getFormattedResults("http://localhost:9090/api/v1/query?query=avg+%28rate+%28nginx_ingress_controller_nginx_process_cpu_seconds_total%7B%7D%5B2m%5D%29%29+&time=")

	for _, r := range results {
		node := r.(map[string]interface{})
		value := node["value"].([]interface{})

		if value[1] != "NaN" {
			cpu_usage_seconds, err := strconv.ParseFloat(value[1].(string), 32)
			if err != nil {
				panic(err)
			}

			fmt.Println("cpu_usage_seconds: ", cpu_usage_seconds)

			if cpu_usage_seconds > MAX_CPU_USAGE_SECONDS {
				return 1
			} else if cpu_usage_seconds < MIN_CPU_USAGE_SECONDS {
				return -1
			}
		}
	}

	return 0
}

func evaluate_error_rates() int {
	results := getFormattedResults("http://localhost:9090/api/v1/query?query=sum%28rate%28nginx_ingress_controller_requests%7Bstatus%3D%7E%22%5B4-5%5D.*%22%7D%5B2m%5D%29%29%2Fsum%28rate%28nginx_ingress_controller_requests%5B2m%5D%29%29&time=")

	for _, r := range results {
		node := r.(map[string]interface{})
		value := node["value"].([]interface{})

		if value[1] != "NaN" {
			error_rate, err := strconv.ParseFloat(value[1].(string), 32)
			if err != nil {
				panic(err)
			}

			fmt.Println("error_rate: ", error_rate)

			if error_rate > MAX_ERROR_RATE {
				return 1
			} else if error_rate < MIN_ERROR_RATE {
				return -1
			}
		}
	}

	return 0
}

func getReplicasChange(replicas int32) int32 {
	change := evaluate_active_connections(replicas) + evaluate_memory() + evaluate_cpu() + evaluate_error_rates()

	return int32(change)
}

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the CustomScaler object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.13.0/pkg/reconcile
func (r *CustomScalerReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := r.Log.WithValues("customScaler", req.NamespacedName)

	var customScaler jasonbehappv1.CustomScaler
	if err := r.Get(ctx, req.NamespacedName, &customScaler); err != nil {
		log.Error(err, "unable to fetch CustomScaler")
		// we'll ignore not-found errors, since they can't be fixed by an immediate
		// requeue (we'll need to wait for a new notification), and we can get them
		// on deleted requests.
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	foundDeployment := &kapps.Deployment{}
	err := r.Get(ctx, types.NamespacedName{Name: "ingress-nginx-controller", Namespace: "ingress-nginx"}, foundDeployment)
	if err != nil && errors.IsNotFound(err) {
		deployment := &kapps.Deployment{}

		// Set default to be 1 replica
		default_replicas := int32(1)
		deployment.Spec.Replicas = &default_replicas

		// Create since it doesn't exist
		log.V(1).Info("Creating Deployment", "deployment", deployment.Name)
		err = r.Create(ctx, deployment)
	} else if err == nil {

		log.Info(fmt.Sprint("foundDeployment.Name: ", foundDeployment.Name))

		log.Info(fmt.Sprint("foundDeployment.Spec.Replicas: ", *foundDeployment.Spec.Replicas))

		replicas_change := getReplicasChange(*foundDeployment.Spec.Replicas)

		log.Info(fmt.Sprint("replicas_change: ", replicas_change))

		final_replicas := *foundDeployment.Spec.Replicas + replicas_change

		log.Info(fmt.Sprint("final_replicas: ", final_replicas))

		if *foundDeployment.Spec.Replicas != final_replicas {
			// set to evaluated_replicas
			minimum_replicas := int32(0)
			if final_replicas < 0 {
				final_replicas = minimum_replicas
			}

			foundDeployment.Spec.Replicas = &final_replicas

			// Update the replica count
			log.Info(string(foundDeployment.Status.Replicas))
			log.V(1).Info("Updating Deployment", "deployment", foundDeployment.Name)

			err = r.Update(ctx, foundDeployment)
		}
	}

	return ctrl.Result{Requeue: true}, err
}

// SetupWithManager sets up the controller with the Manager.
func (r *CustomScalerReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&jasonbehappv1.CustomScaler{}).
		Owns(&kapps.Deployment{}).
		Complete(r)
}
