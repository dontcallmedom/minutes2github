import {githubRe} from "./parse-minutes.mjs";

export function formatGithubComment(annotatedLinks) {
  const multiple = annotatedLinks.length > 1;
  let comment = `This issue ${multiple ? ":\n" : ""}`;
  for (const annotatedLink of annotatedLinks.sort((a, b) => a.url.localeCompare(b.url))) {
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
    comment += `${multiple ? "\n* " : "" } ${state} in [the minutes of ${annotatedLink.title} ${annotatedLink.context ? ` (${annotatedLink.context.title})`: ""}](${annotatedLink.url}#${annotatedLink?.context?.id || ''})`;
    if (annotatedLink.type === "resolved") {
      comment += `:

> ${annotatedLink.resolution}
`;
    }
  }
  return comment;
}

export async function updateGithub(octokit, annotatedLinks, {dryRun}) {
  const groupedLinks = annotatedLinks.reduce((obj, annotatedLink) => {
    if (!obj[annotatedLink.link]) {
      obj[annotatedLink.link] = [];
    }
    obj[annotatedLink.link].push(annotatedLink);
    return obj;
  }, {});
  for (const link of Object.keys(groupedLinks)) {
    const comment = formatGithubComment(groupedLinks[link]);
    // submit on relevant github issue
    const [, owner, repo,, issue_number] = link.match(githubRe);
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
