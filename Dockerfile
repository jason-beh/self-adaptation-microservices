FROM custompodautoscaler/python:latest
RUN apt-get update
RUN apt-get install jq curl -y
RUN echo 'alias metrics="curl -X GET http://localhost:5000/api/v1/metrics | jq ."' >> ~/.bashrc
RUN echo 'alias evaluation="curl -X POST http://localhost:5000/api/v1/evaluation | jq ."' >> ~/.bashrc
ADD config.yaml evaluate.py metric.py /
