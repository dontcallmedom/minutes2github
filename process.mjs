import {JSDOM} from "jsdom";
import fs from "fs";
import {parseMinutes} from "./lib/parse-minutes.mjs";
import {updateGithub} from "./lib/github-comments.mjs";
const isMainModule = import.meta.url.endsWith(process.argv[1]);

let dryRun = false;

let GH_TOKEN, octokit;


if (isMainModule) {
  let minutesUrl;
  if (process.argv[2] === "--dry-run") {
    dryRun = true;
    minutesUrl = process.argv[3];
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
    minutesUrl = process.argv[2];
  }
  JSDOM.fromURL(minutesUrl).then(dom =>
    parseMinutes(dom.window.document, minutesUrl)
  ).then(res => updateGithub({...res, GH_TOKEN, dryRun}))
    .catch(err => {
      console.error(err);
      process.exit(2);
    });
}
