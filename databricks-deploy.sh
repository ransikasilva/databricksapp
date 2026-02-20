#!/bin/bash

# Databricks App Deployment Script
# This script syncs your local code to Databricks workspace and deploys

APP_NAME="my-databricks-app"
WORKSPACE_PATH="/Workspace/Users/ransikasilva03.22@gmail.com/${APP_NAME}"

echo "📦 Syncing source code to Databricks workspace..."
databricks workspace upload-dir . "${WORKSPACE_PATH}" --overwrite

echo "🚀 Deploying app to Databricks..."
databricks apps deploy "${APP_NAME}" --source-code-path "${WORKSPACE_PATH}"

echo "✅ Deployment complete!"
echo "📋 View logs:"
echo "   databricks apps logs ${APP_NAME}"
echo ""
echo "🌐 View app:"
echo "   databricks apps get ${APP_NAME}"
