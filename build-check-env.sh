#!/bin/sh
# build-check-env.sh
# Este script asegura que la variable VITE_API_BASE_URL esté definida antes de hacer el build

if [ -z "$VITE_API_BASE_URL" ]; then
  echo "[ERROR] La variable VITE_API_BASE_URL no está definida."
  echo "Por favor, define VITE_API_BASE_URL en tu .env o en el entorno antes de hacer el build."
  exit 1
else
  echo "[OK] VITE_API_BASE_URL=$VITE_API_BASE_URL"
fi

npm run build
