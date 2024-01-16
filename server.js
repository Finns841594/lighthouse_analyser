import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import express from 'express';

const app = express();
const port = 3000;

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port,
  };
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  return runnerResult.lhr;
}

app.use(express.json());

app.post('/analyze', async (req, res) => {
  // Extract URL from request
  const url = req.body.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  runLighthouse(url)
    .then(results => {
      res.send(results);
    })
    .catch(err => {
      res.status(500).send('Error running Lighthouse: ' + err.message);
    });

  // res.send('Lighthouse analysising');
});

app.listen(port, () => {
  console.log(`Lighthouse microservice listening at http://localhost:${port}`);
});
