import {githubRe} from "./parse-minutes.mjs";
import {Octokit} from "./octokit.mjs";

function formatGithubComment(annotatedLink, url, title) {
  let state;
  switch(annotatedLink.type) {
  case "resolved":
    state = "had an associated resolution";
    break;
  case "discussed":
    state = "was discussed";
    break;
  default:
    state = "was mentioned";
  }
  let comment = `This issue ${state} in [the minutes of ${title} ${annotatedLink.context ? ` (${annotatedLink.context.title})`: ""}](${url}#${annotatedLink?.context?.id || ''})`;
  if (annotatedLink.type === "resolved") {
    comment += `:

> ${annotatedLink.resolution}
`;
  }
  return comment;
}

export async function updateGithub({url, title, annotatedLinks, GH_TOKEN, dryRun}) {
  const octokit = new Octokit({
    auth: GH_TOKEN,
    //log: console
  });

  for (const annotatedLink of annotatedLinks) {
    const comment = formatGithubComment(annotatedLink, url, title);
    // submit on relevant github issue
    const [, owner, repo,, issue_number] = annotatedLink.link.match(githubRe);
    console.log(`submitting to https://github.com/${owner}/${repo}/issues/${issue_number}`);
    console.log(comment);
    if (dryRun) {
      console.log("- not really, dry run");
    } else {
      await octokit.rest.issues.createComment(
	{owner, repo, issue_number, body: comment}
      );
    }
  }
}
