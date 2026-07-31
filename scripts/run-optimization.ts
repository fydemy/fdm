import { optimizeDirectory } from "./optimize-images";
import path from "path";

async function main() {
  try {
    console.log("🔧 Optimizing images in /public directory...");
    
    const publicDir = path.join(process.cwd(), "public");
    const results = await optimizeDirectory(publicDir, {
      recursive: true,
      pattern: /\.(png|jpe?g)$/i, // Only optimize PNG and JPEG images
      convertToWebP: true,
      generateResponsive: false, // Don't generate responsive sizes for static assets
      compress: true,
    });

    console.log(`\n✅ Optimization complete! Processed ${results.length} images`);
    
    // Show summary
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const result of results) {
      if (result && result.webp) {
        totalOriginalSize += result.sizeReduction.original;
        totalOptimizedSize += result.sizeReduction.optimized;
      }
    }
    
    if (totalOriginalSize > 0) {
      const totalSaved = totalOriginalSize - totalOptimizedSize;
      const percentSaved = Math.round((totalSaved / totalOriginalSize) * 100);
      
      console.log(`\n📊 Summary:`);
      console.log(`   Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${percentSaved}%)`);
    }
    
    console.log("\n📝 Recommendations:");
    console.log("   1. Update img tags to use the new .webp versions");
    console.log("   2. Use the OptimizedImage component for better performance");
    console.log("   3. Consider serving images from a CDN for production");
    
  } catch (error) {
    console.error("❌ Error optimizing images:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as optimizeImages };