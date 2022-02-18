import handleStaticFiles from './static';
import handlePages from './pages';
import handleComponents from './components';
import handleData from './data';

async function main() {

  // Get data to be used across the entire site.
  const data = await handleData();

  await handleComponents();
  await handlePages(data);
  await handleStaticFiles();
}

main();
