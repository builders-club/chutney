import handleStaticFiles from "./static/index.js";
import handlePages from "./pages/index.js";
import handleComponents from "./components/index.js";
import handleData from "./data/index.js";

export default async function chutney() {
  // Get data to be used across the entire site.
  const data = await handleData();

  await handleComponents();
  await handlePages(data);
  await handleStaticFiles();
}
