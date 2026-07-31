import fs from "fs/promises";
import path from "path";

export async function compressUploadedImage(inputPath: string, outputPath: string, width?: number, height?: number, quality = 85) {
  const sharp = require("sharp");
  
  try {
    let transformer = sharp(inputPath);
    
    // Apply size constraints
    if (width || height) {
      transformer = transformer.resize(width, height, {
        fit: "cover",
        withoutEnlargement: true
      });
    }
    
    // Convert to WebP with quality
    await transformer.webp({ quality }).toFile(outputPath);
    
    // Get file sizes for comparison
    const [originalStats, optimizedStats] = await Promise.all([
      fs.stat(inputPath),
      fs.stat(outputPath)
    ]);
    
    const sizeReduction = originalStats.size - optimizedStats.size;
    const percentReduction = Math.round((sizeReduction / originalStats.size) * 100);
    
    return {
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      sizeReduction,
      percentReduction,
      outputPath
    };
  } catch (error) {
    console.error("Error compressing uploaded image:", error);
    throw error;
  }
}