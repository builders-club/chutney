import fs from "fs/promises";
import path from "path";
import { ChutneyPage } from "../types/chutneyPage";

const distDir = "./dist/";

async function handleSitemap(pages: ChutneyPage[]) {
  // iterate through all generated pages and add
  // to the sitemap
  console.log(pages);
}

export default handleSitemap;
