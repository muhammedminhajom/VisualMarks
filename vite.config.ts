import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function createMinimalPNG(width, height, color = [0x4f, 0x46, 0xe5]) {
  const [r, g, b] = color;
  
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width + 1)] = 0;
    for (let x = 0; x < width; x++) {
      rawData[y * (width + 1) + 1 + x * 3] = r;
      rawData[y * (width + 1) + 1 + x * 3 + 1] = g;
      rawData[y * (width + 1) + 1 + x * 3 + 2] = b;
    }
  }

  const idat = zlib.deflateSync(rawData);

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    PNG_SIGNATURE,
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', idat),
    writeChunk('IEND', iend),
  ]);
}

function generateIcons() {
  const iconsDir = path.resolve(__dirname, 'public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 32, 48, 128];
  sizes.forEach(size => {
    const png = createMinimalPNG(size, size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  });
}

function copyManifestAndIcons() {
  return {
    name: 'copy-manifest-and-icons',
    buildStart() {
      generateIcons();
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const publicDir = path.resolve(__dirname, 'public');

      fs.copyFileSync(
        path.join(publicDir, 'manifest.json'),
        path.join(distDir, 'manifest.json')
      );

      if (fs.existsSync(path.join(distDir, 'public', 'popup.html'))) {
        fs.copyFileSync(
          path.join(distDir, 'public', 'popup.html'),
          path.join(distDir, 'popup.html')
        );
      }
      if (fs.existsSync(path.join(distDir, 'public', 'dashboard.html'))) {
        fs.copyFileSync(
          path.join(distDir, 'public', 'dashboard.html'),
          path.join(distDir, 'dashboard.html')
        );
      }

      const distPublic = path.join(distDir, 'public');
      if (fs.existsSync(distPublic)) {
        fs.rmSync(distPublic, { recursive: true, force: true });
      }

      const iconsSrcDir = path.join(publicDir, 'icons');
      const iconsDestDir = path.join(distDir, 'icons');
      if (!fs.existsSync(iconsDestDir)) {
        fs.mkdirSync(iconsDestDir, { recursive: true });
      }

      const iconSizes = [16, 32, 48, 128];
      iconSizes.forEach(size => {
        const sourcePath = path.join(iconsSrcDir, `icon${size}.png`);
        const destPath = path.join(iconsDestDir, `icon${size}.png`);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifestAndIcons()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'public/popup.html'),
        dashboard: path.resolve(__dirname, 'public/dashboard.html'),
        background: path.resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});