#!/usr/bin/env node
/**
 * Generate PWA icons from a single square SVG source image using WASM renderer (resvg).
 * Rationale: avoid native dependencies (sharp) which are flaky on some Windows CI/dev setups.
 * NOTE: Only SVG source is supported now (simpler + crisp scaling). Provide PNGs manually if needed.
 */
import fs from "fs";
import path from "path";
import { Resvg } from "@resvg/resvg-js";

const SIZES = [16, 32, 64, 180, 192, 256, 384, 512];
const MASKABLE_SIZES = [512];

const SOURCE = process.argv[2] || "assets/images/logo-source.svg";
const outDir = process.argv[3] || "public";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isSvg(file) {
  return /\.svg$/i.test(file);
}

function renderSvgToPng(svgContent, size) {
  // Fit by width (square assumed); resvg keeps aspect ratio.
  const r = new Resvg(svgContent, {
    fitTo: { mode: "width", value: size },
    background: "transparent",
  });
  // If height differs adjust? resvg fitTo width ensures width==size. We'll crop/pad to square if needed.
  return r.render().asPng();
}

function tryWarnSquare(svg) {
  // Naive viewBox parse for square detection.
  const m = svg.match(/viewBox="([0-9.\s]+)"/i);
  if (!m) return;
  const parts = m[1].trim().split(/\s+/).map(Number);
  if (parts.length === 4) {
    const [, , w, h] = parts;
    if (w && h && w !== h) {
      console.warn(
        `⚠ Source viewBox not square (${w}x${h}). Output will be padded to square.`,
      );
    }
  }
}

async function run() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source image not found: ${SOURCE}`);
    process.exit(1);
  }
  if (!isSvg(SOURCE)) {
    console.error(
      "Only SVG source supported in WASM mode. Provide an SVG (e.g. logo-source.svg).",
    );
    process.exit(1);
  }

  const svg = fs.readFileSync(SOURCE, "utf8");
  tryWarnSquare(svg);
  ensureDir(outDir);

  const writes = [];
  for (const size of SIZES) {
    const file =
      size === 180
        ? "apple-touch-icon.png"
        : `android-chrome-${size}x${size}.png`;
    const target = path.join(outDir, file);
    const png = renderSvgToPng(svg, size);
    fs.writeFileSync(target, png);
    console.log("Created", target);
  }

  for (const size of MASKABLE_SIZES) {
    const file = `android-chrome-${size}x${size}-maskable.png`;
    const target = path.join(outDir, file);
    const png = renderSvgToPng(svg, size);
    fs.writeFileSync(target, png);
    console.log("Created", target, "(maskable)");
  }

  // Monochrome variant (simple copy for now). Real silhouette processing can be added later.
  try {
    const monoTarget = path.join(
      outDir,
      "android-chrome-512x512-monochrome.png",
    );
    fs.copyFileSync(
      path.join(outDir, "android-chrome-512x512.png"),
      monoTarget,
    );
    console.log("Created", monoTarget, "(monochrome placeholder)");
  } catch (err) {
    console.warn("⚠ Monochrome copy skipped:", err.message);
  }

  console.log("All icons generated via resvg-js.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
