import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";

const snippetDir = "./src/components/";

async function registerHelpers() {
  try {
    const files = await fs.readdir(snippetDir);

    for (const file of files) {
      const { ext } = path.parse(file);

      const raw = await fs.readFile(`${snippetDir}${file}`, "utf-8");

      const rawHtmlFile = await unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeStringify)
        .process(raw);

      const html = String(rawHtmlFile);

      Handlebars.registerHelper(file.replace(ext, ""), (data) => {
        const template = Handlebars.compile(html);
        const renderedContent = template(data);
        return new Handlebars.SafeString(renderedContent);
      });
    }
  } catch (err) {
    console.log(err);
    console.log("No snippets found.");
  }
}

export default registerHelpers;
