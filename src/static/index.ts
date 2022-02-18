import fs from 'fs/promises';
import path from 'path';

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      await fs.copyFile(srcPath, destPath);
  }
}

async function moveStaticFiles() {
  await copyDir('./public', './dist')
}

export default moveStaticFiles;