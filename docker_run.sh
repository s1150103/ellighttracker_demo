#!/bin/bash

docker run -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/keys/credentials.json \
  -v $(pwd)/credentials.json:/app/keys/credentials.json:ro \
  flask-app

