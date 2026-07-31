import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Configuration for image optimization
const CONFIG = {
  // Quality settings for different formats
  jpeg: { quality: 80, progressive: true },
  png: { quality: 85, compressionLevel: 8 },
  webp: { quality: 85 },
  
  // Dimensions for common image sizes
  sizes: {
    avatar: [40, 40],
    profile: [200, 200],
    thumbnail: [400, 400],
    medium: [800, 800],
    large: [1200, 1200],
  }
};

// Convert image to WebP format
async function convertToWebP(inputPath: string, outputPath: string, options: any = {}) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  return image
    .webp({ 
      quality: CONFIG.webp.quality, 
      ...options 
    })
    .toFile(outputPath);
}

// Generate responsive image sizes
async function generateResponsiveSizes(inputPath: string, outputDir: string, baseName: string) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Generate multiple sizes
  const sizes = [
    { name: 'sm', width: 400 },
    { name: 'md', width: 800 },
    { name: 'lg', width: 1200 },
  ];
  
  const generatedImages = [];
  
  for (const size of sizes) {
    if (metadata.width && metadata.width > size.width) {
      const outputPath = path.join(outputDir, `${baseName}-${size.name}.webp`);
      await image
        .resize(size.width, null, { withoutEnlargement: true })
        .webp({ quality: CONFIG.webp.quality })
        .toFile(outputPath);
      
      generatedImages.push({
        path: outputPath,
        width: size.width,
        name: size.name
      });
    }
  }
  
  return generatedImages;
}

// Compress existing images
async function compressImage(inputPath: string, outputPath: string, format: string) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  switch (format) {
    case 'jpeg':
      return image
        .jpeg(CONFIG.jpeg)
        .toFile(outputPath);
    case 'png':
      return image
        .png(CONFIG.png)
        .toFile(outputPath);
    case 'webp':
      return image
        .webp(CONFIG.webp)
        .toFile(outputPath);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// Get image format from file extension
function getImageFormat(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  const formatMap: Record<string, string> = {
    '.jpg': 'jpeg',
    '.jpeg': 'jpeg',
    '.png': 'png',
    '.webp': 'webp',
    '.gif': 'gif',
  };
  return formatMap[ext] || null;
}

// Optimize a single image file
export async function optimizeImage(inputPath: string, options: {
  convertToWebP?: boolean;
  generateResponsive?: boolean;
  compress?: boolean;
} = {}) {
  const format = getImageFormat(inputPath);
  if (!format) {
    console.warn(`Unsupported image format: ${inputPath}`);
    return null;
  }
  
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const results = {
    original: inputPath,
    webp: null as string | null,
    compressed: null as string | null,
    responsive: [] as Array<{ path: string; width: number; name: string }>,
    sizeReduction: {
      original: 0,
      optimized: 0,
      percentage: 0,
    }
  };
  
  try {
    // Get original file size
    const originalStats = await fs.stat(inputPath);
    results.sizeReduction.original = originalStats.size;
    
    // Convert to WebP
    if (options.convertToWebP && format !== 'webp') {
      const webpPath = path.join(dir, `${baseName}.webp`);
      await convertToWebP(inputPath, webpPath);
      results.webp = webpPath;
      
      // Calculate size reduction
      const webpStats = await fs.stat(webpPath);
      results.sizeReduction.optimized = webpStats.size;
      results.sizeReduction.percentage = Math.round(
        ((originalStats.size - webpStats.size) / originalStats.size) * 100
      );
    }
    
    // Compress existing image
    if (options.compress && (format === 'jpeg' || format === 'png')) {
      const compressedPath = path.join(dir, `${baseName}-compressed${path.extname(inputPath)}`);
      await compressImage(inputPath, compressedPath, format);
      results.compressed = compressedPath;
    }
    
    // Generate responsive sizes
    if (options.generateResponsive) {
      const responsiveDir = path.join(dir, 'responsive');
      await fs.mkdir(responsiveDir, { recursive: true });
      results.responsive = await generateResponsiveSizes(inputPath, responsiveDir, baseName);
    }
    
    return results;
  } catch (error) {
    console.error(`Error optimizing image ${inputPath}:`, error);
    return null;
  }
}

// Batch optimize all images in a directory
export async function optimizeDirectory(inputDir: string, options: {
  recursive?: boolean;
  pattern?: RegExp;
  convertToWebP?: boolean;
  generateResponsive?: boolean;
  compress?: boolean;
} = {}) {
  const {
    recursive = true,
    pattern = /\.(png|jpe?g|webp)$/i,
    convertToWebP = true,
    generateResponsive = true,
    compress = false,
  } = options;
  
  const results: Array<{
    original: string;
    webp: string | null;
    compressed: string | null;
    responsive: Array<{ path: string; width: number; name: string }>;
    sizeReduction: {
      original: number;
      optimized: number;
      percentage: number;
    };
  } | null> = [];
  
  async function processDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && recursive) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        const result = await optimizeImage(fullPath, {
          convertToWebP,
          generateResponsive,
          compress,
        });
        if (result) {
          results.push(result);
        }
      }
    }
  }
  
  await processDirectory(inputDir);
  return results;
}