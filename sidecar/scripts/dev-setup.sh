#!/usr/bin/env bash
# Run this once after cloning to set up the full project

set -e

echo "==> Installing frontend dependencies..."
npm install

echo "==> Installing sidecar dependencies..."
cd sidecar && npm install && cd ..

echo "==> Building sidecar..."
cd sidecar
npm run build
echo "  Sidecar built to sidecar/dist/"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run tauri:dev"
echo ""
echo "To build for production:"
echo "  npm run tauri:build"
