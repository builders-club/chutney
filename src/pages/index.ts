import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

const pagesDir = './src/pages/';
const distDir = './dist/'

let allData = {};

async function registerPages(data) {
  allData = data;
  await processDir(pagesDir);
}

async function processDir(directory) {
  try {

    const files = await fs.readdir(directory);
    let outputDirectory = `${distDir}${directory.replace(pagesDir, '')}`;

    // Check to see if the directory exists and create if not.
    try {
      await fs.readdir(outputDirectory);
    }
    catch (err) {
      await fs.mkdir(outputDirectory);
    }

    for (const file of files) {
      const { ext } = path.parse(file);

      if (ext) {
        const html = await fs.readFile(`${directory}${file}`, 'utf-8')

        const template = Handlebars.compile(html);

        if (file.includes('[')) {
          const dataProp = outputDirectory.split('/').slice(-2)[0];
          const prop = file.replace(ext, '').replace('[', '').replace(']', '');

          const sourceData = allData[dataProp];

          if (sourceData && Array.isArray(sourceData)) {
            for (const data of sourceData) {

              const result = template({ ...allData, ...data });

              const pathValue = getPropValue(data, prop)

              try {
                await fs.readdir(`${outputDirectory}${pathValue}/`);
              }
              catch (err) {
                await fs.mkdir(`${outputDirectory}${pathValue}/`);
              }
              await fs.writeFile(`${outputDirectory}${pathValue}/index.html`, result);
            }
          }
        } else {
          const result = template(allData);

          if (file.replace(ext, '').toLocaleLowerCase() !== 'index') {
            try {
              await fs.readdir(`${outputDirectory}${file.replace(ext, '')}/`);
            }
            catch (err) {
              await fs.mkdir(`${outputDirectory}${file.replace(ext, '')}/`);
            }
            await fs.writeFile(`${outputDirectory}${file.replace(ext, '')}/index.html`, result);
          } else {
            await fs.writeFile(`${outputDirectory}index.html`, result);
          }
        }
      } else {
        await processDir(`${directory}${file}/`);
      }
    }
  } catch (err) {
    console.log(err)
    console.log('No pages found.');
  }

}

function getPropValue(data, prop) {
  const steps = prop.split('.');
  let value = data;
  while (steps.length > 0) {
    value = value[steps[0]];
    steps.splice(0, 1);
  }
  return value;
}

export default registerPages;
