import {JSDOM} from "jsdom";
import fs from "fs";
import {parseMinutes} from "./lib/parse-minutes.mjs";
import {Octokit} from "./lib/octokit.mjs";
import {updateGithub} from "./lib/github-comments.mjs";
const isMainModule = import.meta.url.endsWith(process.argv[1]);

let dryRun = false;

let GH_TOKEN, octokit;


if (isMainModule) {
  let minutesUrls = [];
  if (process.argv[2] === "--dry-run") {
    dryRun = true;
    minutesUrls = process.argv.slice(3);
  } else {
    GH_TOKEN = (() => {
      try {
	const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
	return config.GH_TOKEN;
      } catch (err) {
	return process.env.GH_TOKEN;
      }
    })();
    if (!GH_TOKEN) {
      console.error("No github token set, can't submit comments");
      process.exit(2);
    }
    const octokit = new Octokit({
      auth: GH_TOKEN,
      //log: console
    });
    minutesUrls = process.argv.slice(2);
  }
  Promise.all(
    minutesUrls.map(minutesUrl => JSDOM.fromURL(minutesUrl)
		    .then(dom => parseMinutes(dom.window.document, minutesUrl))
		       )
  )
    .then(res => updateGithub(octokit, res.flat(), {dryRun}))
    .catch(err => {
      console.error(err);
      process.exit(2);
    });
}


