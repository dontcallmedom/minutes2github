import {githubRe} from "./github-link-pattern.mjs";
import {parsePDF} from "./parse-pdf.mjs";
const headingSelector = ":is(h1,h2,h3,h4,h5,h6)";

// Find the closest previous heading associated to the given element
function getCurrentHeading(el) {
  let curEl = el.previousElementSibling ?? el.parentElement;
  while (curEl && curEl.tagName !== "BODY") {
    if (curEl.matches(headingSelector)) {
      return curEl;
    }
    curEl = curEl.previousElementSibling ?? curEl.parentElement;
  }
  return;
}

function getId(el) {
  if (el.id) return el.id;
  if (el.querySelector("[id]")) return el.querySelector("[id]").id;
  if (el.querySelector("a[name]")) return el.querySelector("a[name]").name;
}

// github recognizes as equivalent org/repo/issues/42 and org/repo/pull/42
// Since scribe.perl only generates links of the former kind,
// we align all links to that form to avoid duplicate
function canonicalizeLink(link) {
  return link.replace("/pull/", "/issues/");
}

export async function parseMinutes(document, url, noPdf = false) {
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
    const context = heading ? {id: getId(heading), title: heading.textContent} : undefined;
    p.querySelectorAll('a[href^="https://github.com/"]').forEach(a => {
      // are they links to issues or PRs?
      if (!a.href.match(githubRe)) return;
      linkFound = true;
      const link = a.href.split("#")[0];
      foundLinks.add(canonicalizeLink(link));
      annotatedLinks.push({link, resolution: p.textContent, context, type: "resolved", title, url});
    });
    // if not, does the current heading have link to an issue?
    if (!linkFound && heading) {
      heading.querySelectorAll('a[href^="https://github.com/"]').forEach(a => {
	if (!a.href.match(githubRe)) return;
	const link = a.href.split("#")[0];
	linkFound = true;
	annotatedLinks.push({link, resolution: p.textContent, context, type: "resolved", title, url});
	foundLinks.add(canonicalizeLink(link));
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
    if (foundLinks.has(canonicalizeLink(link))) return;
    // is this in a heading? if so, this counts as discussed, otherwise as mentioned
    let heading = a.closest(headingSelector);
    if (heading) {
      annotatedLinks.push({link, context: {id: getId(heading), title: heading.textContent}, type: "discussed", title, url});
      foundLinks.add(canonicalizeLink(link));
    } else if (!a.closest(".irc"))
      // in scribe.perl, IRC comments are not correctible
      // so not sure we should include URLs from them
    {
      let heading = getCurrentHeading(a);
      const context = heading ? {id: getId(heading), title: heading.textContent} : undefined;
      annotatedLinks.push({link, context, type: "mentioned", title, url});
      foundLinks.add(canonicalizeLink(link));
    }
  });

  if (!noPdf) {
    // Look for links in possible PDF slidesets
    const pdfs = new Set();
    document.querySelectorAll('p').forEach(p => {
      if (p.textContent.match(/^slideset:/i)) {
	const pdfUrl = p.querySelector("a[href]")?.href;
	if (pdfUrl?.match(/\.pdf$/)) {
	  pdfs.add(pdfUrl);
	}
      }
    });
    let pdfLinks = [];
    for (const pdfUrl of pdfs) {
      let pdfBuffer;
      try {
	pdfBuffer = await fetch(pdfUrl).then(r => r.arrayBuffer());
	pdfLinks = pdfLinks.concat(await parsePDF(pdfBuffer, pdfUrl));
      } catch (e) {
	console.error(`Error while parsing ${pdfUrl}: ${e}`);
      }
    }
    for (const l of pdfLinks) {
      if (!foundLinks.has(canonicalizeLink(l.link))) {
	annotatedLinks.push(l);
	foundLinks.add(canonicalizeLink(l.link));
      }
    }
  }
  return annotatedLinks;
}

