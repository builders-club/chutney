import { PageFrontmatter } from "./../types/pageFrontmatter";
import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import remarkParseYaml from "remark-parse-yaml";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";

import { ChutneyPage } from "../types/chutneyPage";

const pagesDir = "./src/pages/";
const layoutDir = "./src/layouts/";
const distDir = "./dist/";

let allData: Record<string, any> = {};

async function registerPages(
  data: Record<string, any>
): Promise<ChutneyPage[]> {
  allData = data;
  return await processDir(pagesDir);
}

async function processDir(directory: string): Promise<ChutneyPage[]> {
  const pages: ChutneyPage[] = [];

  try {
    const files = await fs.readdir(directory);
    const outputDirectory = `${distDir}${directory.replace(pagesDir, "")}`;

    // Check to see if the directory exists and create if not.
    try {
      await fs.readdir(outputDirectory);
    } catch (err) {
      await fs.mkdir(outputDirectory);
    }

    for (const file of files) {
      const { ext } = path.parse(file);

      if (ext) {
        const page = await fs.readFile(`${directory}${file}`, "utf-8");
        let frontmatter: PageFrontmatter = {};

        const rawPage = await unified()
          .use(remarkParse)
          .use(remarkFrontmatter)
          .use(remarkParseYaml)
          .use(() => (tree) => {
            const yaml = tree.children.find((f) => f.type == "yaml");
            if (yaml && yaml.data) {
              frontmatter = yaml.data.parsedValue as Object;
            }
            return tree;
          })
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeRaw)
          .use(rehypeStringify)
          .process(page);

        let layoutFileName = frontmatter.layout || "default";
        let html = "";

        try {
          html = await fs.readFile(
            `${layoutDir}${layoutFileName}.html`,
            "utf-8"
          );
        } catch (err) {}

        const chutneyContent = String(rawPage);
        html = html.replace("{{chutneyPage}}", chutneyContent);

        const template = Handlebars.compile(html);
        let route = "";

        if (file.includes("[")) {
          const dataProp = outputDirectory.split("/").slice(-2)[0];
          const prop = file.replace(ext, "").replace("[", "").replace("]", "");

          const sourceData = allData[dataProp];

          if (sourceData && Array.isArray(sourceData)) {
            for (const data of sourceData) {
              const result = template({ ...allData, ...data });

              const pathValue = getPropValue(data, prop);

              try {
                await fs.readdir(`${outputDirectory}${pathValue}/`);
              } catch (err) {
                await fs.mkdir(`${outputDirectory}${pathValue}/`);
              }
              await fs.writeFile(
                `${outputDirectory}${pathValue}/index.html`,
                result
              );
              route = `${outputDirectory}${pathValue}`;

              pages.push({
                title: data.title || frontmatter.title,
                description: data.description || frontmatter.description || "",
                publishedAt: new Date(
                  data.publishedAt || frontmatter.publishedAt || new Date()
                ),
                route: `/${route.replace(distDir, "")}/`,
              });
            }
          }
        } else {
          const result = template({ ...allData });

          if (file.replace(ext, "").toLocaleLowerCase() !== "index") {
            try {
              await fs.readdir(`${outputDirectory}${file.replace(ext, "")}/`);
            } catch (err) {
              await fs.mkdir(`${outputDirectory}${file.replace(ext, "")}/`);
            }
            await fs.writeFile(
              `${outputDirectory}${file.replace(ext, "")}/index.html`,
              result
            );
            route = `${outputDirectory}${file.replace(ext, "")}/`;
          } else {
            await fs.writeFile(`${outputDirectory}index.html`, result);
            route = `${outputDirectory}`;
          }

          pages.push({
            title: frontmatter.title,
            description: frontmatter.description,
            publishedAt: frontmatter.publishedAt || new Date(),
            route: `/${route.replace(distDir, "")}`,
          });
        }
      } else {
        pages.push(...(await processDir(`${directory}${file}/`)));
      }
    }
  } catch (err) {
    console.log(err);
    console.log("No pages found.");
  }

  return pages;
}

function getPropValue(data: any, prop: string) {
  const steps = prop.split(".");
  let value = data;
  while (steps.length > 0) {
    value = value[steps[0]];
    steps.splice(0, 1);
  }
  return value;
}

export default registerPages;
