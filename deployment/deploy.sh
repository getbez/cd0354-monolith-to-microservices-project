# /bin/bash

kubectl delete deployments udagram-frontend udagram-api-user udagram-api-feed udagram-reverse-proxy
kubectl delete svc udagram-frontend udagram-api-user udagram-api-feed udagram-reverse-proxy

kubectl apply -f ./env-configmap.yaml
kubectl apply -f ./env-secret.yaml
kubectl apply -f ./aws-secret.yaml

kubectl apply -f ../udagram-api-feed/deployment/deployment.yml
kubectl apply -f ../udagram-api-feed/deployment/service.yml

kubectl apply -f ../udagram-api-user/deployment/deployment.yml
kubectl apply -f ../udagram-api-user/deployment/service.yml

kubectl apply -f ../udagram-reverse-proxy/deployment/deployment.yml
kubectl apply -f ../udagram-reverse-proxy/deployment/service.yml

kubectl apply -f ../udagram-frontend/deployment/deployment.yml
kubectl apply -f ../udagram-frontend/deployment/service.yml


kubectl expose deployment udagram-frontend --type=LoadBalancer --name=udagram-public-frontend
kubectl expose deployment udagram-reverse-proxy --type=LoadBalancer --name=public-udagram-reverse-proxy

echo '----deployments----'
kubectl get deployments

echo '----services----'
kubectl get svc

echo '----pods----'
kubectl get pods
