kubectl apply -f infra/k8s -n referit
kubectl rollout restart deployment.apps/referit-backend-deployment -n referit
kubectl rollout status deployment.apps/referit-backend-deployment -n referit
