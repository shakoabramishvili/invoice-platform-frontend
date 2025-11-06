#!/bin/bash

# Script to completely clean and redeploy frontend
# Run this on the server: bash clean-deploy.sh

cd /var/www/invoice-platform-frontend

echo "Stopping PM2 frontend..."
pm2 stop frontend
pm2 delete frontend

echo "Completely removing build artifacts with sudo..."
sudo rm -rf .next
rm -rf node_modules/.cache

echo "Clearing PM2 logs..."
pm2 flush

echo "Installing dependencies..."
yarn install --frozen-lockfile

echo "Building fresh..."
NODE_OPTIONS="--max-old-space-size=2048" yarn build

echo "Starting with PM2..."
pm2 start ecosystem.config.js

echo "Saving PM2 configuration..."
pm2 save

echo "Done! Frontend cleaned and redeployed."
