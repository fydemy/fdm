#!/bin/bash

# Image Optimization Script

echo "🚀 Starting image optimization for the FDM project..."

# Install sharp if not already installed
if ! npm list sharp > /dev/null 2>&1; then
    echo "📦 Installing sharp for image processing..."
    npm install sharp --save-dev
fi

# Run the optimization script
echo "🔄 Converting images to WebP and optimizing..."
npx tsx scripts/run-optimization.ts

echo "✅ Image optimization complete!"
echo ""
echo "📊 Next steps:"
echo "1. Review the generated WebP images in the /public directory"
echo "2. Test the updated Image components throughout the application"
echo "3. Run 'npm run build' to verify everything works correctly"
echo "4. Consider setting up a CDN for production image serving"