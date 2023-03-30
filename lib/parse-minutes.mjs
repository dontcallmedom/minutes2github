export const githubRe = /^https:\/\/github.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/([0-9]+)/;
const headingSelector = ":is(h1,h2,h3,h4,h5,h6";

// Find the closest previous heading associated to the given element
function getCurrentHeading(el) {
  let curEl = el.previousElementSibling;
  while (curEl) {
    if (curEl.matches(headingSelector)) {
      return curEl;
    }
    curEl = curEl.previousElementSibling;
  }
  return;
}


export function parseMinutes(document, url) {
  const foundLinks = new Set();
  // annotatedLinks can be set with a type of:
  // resolved: issue/PR linked from a resolution or from topic or subtopic with a resolution
  // discussed: issue/PR linked from a topic or subtopic in the minutes
  // mentioned: issue/PR linked from the minutes
  const annotatedLinks = [];

  const title = document.querySelector("title").textContent;

  // Look for resolutions
  // TODO: this is scribe.perl specific - is there a more generic convention?
  // e.g. detecting "RESOLVED:" "RESOLUTION:" at the start of a paragraph?
  document.querySelectorAll('p.resolution').forEach(p => {
    // is there a link to an issue or a pr in the resolution itself?
    let linkFound = false;
    const heading = getCurrentHeading(p);
    const context = heading ? {id: heading.id, title: heading.textContent} : undefined;
    p.querySelectorAll('a[href^="https://github.com/"]').forEach(a => {
      // are they links to issues or PRs?
      if (!a.href.match(githubRe)) return;
      linkFound = true;
      const link = a.href.split("#")[0];
      foundLinks.add(link);
      annotatedLinks.push({link, resolution: p.textContent, context, type: "resolved", title, url});
    });
    // if not, does the current heading have link to an issue?
    // TODO: scribe.perl specific
    if (!linkFound && heading) {
      heading.querySelectorAll('a[href^="https://github.com/"]').forEach(a => {
	if (!a.href.match(githubRe)) return;
	const link = a.href.split("#")[0];
	linkFound = true;
	annotatedLinks.push({link, resolution: p.textContent, context, type: "resolved", title, url});
	foundLinks.add(link);
      });
    }
    if (!linkFound) {
      console.warn(`Resolution found not associated with a github issue or PR: ${p.textContent}`);
    }
  });

  // look for links to github
  document.querySelectorAll('a[href^="https://github.com/"]').forEach(a => {
    // are they links to issues or PRs?
    if (!a.href.match(githubRe)) return;
    // drop the hash if any
    const link = a.href.split("#")[0];
    // have they been already handled?
    if (foundLinks.has(link)) return;
    // is this in a heading? if so, this counts as discussed, otherwise as mentioned
    let heading = a.closest(headingSelector);
    if (heading) {
      annotatedLinks.push({link, context: {id: heading.id, title: heading.textContent}, type: "discussed", title, url});
      foundLinks.add(link);
    } else if (!a.closest(".irc"))
      // in scribe.perl, IRC comments are not correctible
      // so not sure we should include URLs from them
    {
      let heading = getCurrentHeading(a);
      const context = heading ? {id: heading.id, title: heading.textContent} : undefined;
      annotatedLinks.push({link, context, type: "mentioned", title, url});
      foundLinks.add(link);
    }
  });
  return annotatedLinks;
}

