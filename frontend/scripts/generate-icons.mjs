#!/usr/bin/env node
/**
 * Generate PWA icons from a single square source image (PNG or SVG).
 * Safe: only writes inside specified output dir (default: frontend/public when run via npm script).
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SIZES = [16, 32, 64, 180, 192, 256, 384, 512];
const MASKABLE_SIZES = [512];

const SOURCE = process.argv[2] || 'assets/images/logo-source.svg';
const outDir = process.argv[3] || 'public';

async function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

async function validateSquare(input){
  try {
    const meta = await sharp(input).metadata();
    if(!meta.width || !meta.height) return;
    if(meta.width !== meta.height) {
      console.warn(`⚠ Source is not square (${meta.width}x${meta.height}). Icons will be distorted.`);
    }
  } catch(e){
    console.warn('⚠ Could not read image metadata (still attempting):', e.message);
  }
}

async function run() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source image not found: ${SOURCE}`);
    process.exit(1);
  }

  await ensureDir(outDir);
  await validateSquare(SOURCE);

  await Promise.all(SIZES.map(async (size) => {
    const file = size === 180 ? 'apple-touch-icon.png' : `android-chrome-${size}x${size}.png`;
    const target = path.join(outDir, file);
    await sharp(SOURCE).resize(size, size).png({ compressionLevel: 9 }).toFile(target);
    console.log('Created', target);
  }));

  await Promise.all(MASKABLE_SIZES.map(async (size) => {
    const file = `android-chrome-${size}x${size}-maskable.png`;
    const target = path.join(outDir, file);
    await sharp(SOURCE)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(target);
    console.log('Created', target, '(maskable)');
  }));

  // Generate a simple monochrome (white) variant for optional use
  const mono = path.join(outDir, 'android-chrome-512x512-monochrome.png');
  try {
    await sharp(SOURCE).resize(512, 512).flatten({ background: '#FFFFFF' }).png({ compressionLevel: 9 }).toFile(mono);
    console.log('Created', mono, '(monochrome suggestion)');
  } catch(e){
    console.warn('⚠ Monochrome generation skipped:', e.message);
  }

  console.log('All icons generated. Update manifest if adding monochrome purpose.');
}

run().catch(err => { console.error(err); process.exit(1); });
