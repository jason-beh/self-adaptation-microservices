from locust import HttpUser, task, between, FastHttpUser

class HelloWorldUser(FastHttpUser):
    wait_time = between(1.0,1.0)

    @task
    def hello_world(self):
        self.client.get("/")