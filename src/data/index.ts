import fs from 'fs/promises';
import path from 'path';

const dataDir = './src/data/';

async function gatherData() {

  let data = {};

  try {
    const dataFiles = await fs.readdir(dataDir);
    for (const file of dataFiles) {
      const { ext } = path.parse(file);
      const dataFunc = (await import(`file://${path.resolve(dataDir)}/${file}`)).default;
      data[file.replace(ext, '')] = await dataFunc();
    }
  }
  catch (err) {
    console.log('No data found.');
  }

  return data;
}

export default gatherData;