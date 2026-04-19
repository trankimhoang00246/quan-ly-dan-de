# chmod +x build.sh

#!/bin/bash
set -e

echo "==> Build backend image..."
cd goat
docker build -t trankimhoang00246/goat-be:latest .
cd ..

echo "==> Build frontend image..."
cd goat-ui
docker build -t trankimhoang00246/goat-ui:latest .
cd ..

echo "==> Push images..."
docker push trankimhoang00246/goat-be:latest
docker push trankimhoang00246/goat-ui:latest
