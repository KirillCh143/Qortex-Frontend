#!/bin/sh
# Generate runtime configuration from environment variables.
# This overwrites the default empty env-config.js in the built dist folder,
# allowing Docker containers to be configured without rebuilding the image.

cat <<EOF > /app/dist/env-config.js
window.__RUNTIME_CONFIG__ = {
  VITE_USE_MOCK_DATA: "${VITE_USE_MOCK_DATA:-false}",
  VITE_SHOW_DEVTOOLS: "${VITE_SHOW_DEVTOOLS:-false}",
  VITE_DIRECTUS_URL: "${VITE_DIRECTUS_URL:-}",
  VITE_N8N_WEBHOOK_URL: "${VITE_N8N_WEBHOOK_URL:-}",
  VITE_PORTAINER_URL: "${VITE_PORTAINER_URL:-}",
  VITE_PORTAINER_TOKEN: "${VITE_PORTAINER_TOKEN:-}",
  VITE_PORTAINER_ENDPOINT_ID: "${VITE_PORTAINER_ENDPOINT_ID:-}"
};
EOF

echo "Runtime config injected into env-config.js"

# Start the static file server
<<<<<<< HEAD
exec npx serve -s /app/dist --listen tcp://0.0.0.0:3000
=======
exec npx serve -s /app/dist -l 3000
>>>>>>> c3f73e1 (	new file:   .dockerignore)
