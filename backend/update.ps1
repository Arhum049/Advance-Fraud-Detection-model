docker stop backend-api
docker rm backend-api
docker build -t fraud-detection-backend .
docker run -d --name backend-api -p 8080:8080 --env-file .env fraud-detection-backend