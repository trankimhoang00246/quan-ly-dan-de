# chmod +x run.sh

echo "==> Start docker compose..."
docker compose down
docker compose up -d

echo "==> Done! Frontend: http://localhost:8742 | Backend: http://localhost:8743"
