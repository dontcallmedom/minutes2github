import {JSDOM} from "jsdom";
import fs from "fs";
import { Command } from 'commander';
import {parseMinutes} from "./lib/parse-minutes.mjs";
import {Octokit} from "./lib/octokit.mjs";
import {updateGithub} from "./lib/github-comments.mjs";
const isMainModule = import.meta.url.endsWith(process.argv[1]);

let dryRun = false;

let GH_TOKEN, octokit;


if (isMainModule) {
  let minutesUrls = [], octokit;
  const ignoreRepos = (() => {
      try {
	const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
	return config.ignore;
      } catch (err) {
	console.error(err);
	return [];
      }
    })();

  const program = new Command();
  program
    .argument('<urls...>')
    .description('Parse HTML minutes of a meeting and update github issues mentioned in them')
    .option('--dry-run', 'Parse but doesn\'t update github')
    .option('--no-pdf', 'Do not include potentially linked PDF slides in the source of links to github issues')
    .action((urls, options) => {
      const { dryRun, pdf }  = options;
      if (!dryRun) {
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
	octokit = new Octokit({
	  auth: GH_TOKEN,
	  //log: console
	});
      }
      Promise.all(
	urls.map(minutesUrl => JSDOM.fromURL(minutesUrl)
		 .then(dom => parseMinutes(dom.window.document, minutesUrl, !pdf))
		)
      )
	.then(res => updateGithub(octokit, res.flat(), {dryRun, ignoreRepos}))
	.catch(err => {
	  console.error(err);
	  process.exit(2);
	});
    });
  program.parse(process.argv);
}


