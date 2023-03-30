import { Octokit, App } from "https://cdn.skypack.dev/octokit";
import {parseMinutes} from "./lib/parse-minutes.mjs";
import {updateGithub, formatGithubComment} from "./lib/github-comments.mjs";

const urlInput = document.getElementById("minutes");
const showBtn = document.getElementById("show");
const entryTmpl = document.getElementById("entry");
const postBtn = document.getElementById("post");
const logEl = document.getElementById("log");
const logEl2 = document.getElementById("log2");
const patInput = document.getElementById("pat");

const outputForm = document.getElementById("output");

let annotatedLinks;

const isReadyToSubmit = () => [...outputForm.querySelectorAll('input[type=checkbox]')].some(el => el.checked && !el.disabled) && !!patInput.value;

urlInput.addEventListener("input", function() {
  showBtn.disabled = !urlInput.value;
});

patInput.addEventListener("input", function() {
  postBtn.disabled = !isReadyToSubmit();
});


showBtn.addEventListener("click", async function(e) {
  e.preventDefault();
  outputForm.querySelector("ul")?.remove();
  logEl2.textContent = '';
  logEl.textContent = "";

  const minutesUrl = urlInput.value;
  const doc = document.createElement("html");
  const html = await fetch(minutesUrl).then(r => r.text())
	.catch(err => logEl.textContent = `Fetching ${minutesUrl} failed: ${err}`);
  if (!html) return;

  patInput.disabled = false;
  doc.innerHTML = html;
  const title = doc.querySelector("title").textContent;
  annotatedLinks = parseMinutes(doc, minutesUrl);
  if (annotatedLinks.length > 0) {
    postBtn.disabled = true;
    const ul = document.createElement("ul");
    for (const annotatedLink of annotatedLinks) {
      const comment = formatGithubComment([annotatedLink]);
      const entry = document.importNode(entryTmpl.content, true);
      entry.querySelector("input").value = annotatedLink.link;
      entry.querySelector("a").href = annotatedLink.link;
      entry.querySelector("a").textContent = annotatedLink.link.split("/").slice(3).join("/");
      entry.querySelector("pre").textContent = comment;
      ul.appendChild(entry);
    }
    ul.addEventListener("change", function(e) {
      postBtn.disabled = !isReadyToSubmit();
    });
    entryTmpl.insertAdjacentElement('afterend', ul);
  } else {
    logEl.textContent = `Did not find any github links to extract from ${minutesUrl}`;
  }
});

postBtn.addEventListener("click", async function(e) {
  e.preventDefault();
  logEl2.textContent = '';
  const octokit = new Octokit({
    auth: patInput.value,
  });
  // Filter results based on selected checkboxes
  const filteredResults = annotatedLinks
    .filter(l => outputForm.querySelector(`input:checked[value="${l.link}"]`));
  await updateGithub(octokit, filteredResults);
  // TODO: deal with errors in submission
  filteredResults.annotatedLinks.forEach(l => {
    outputForm.querySelector(`input:checked[value="${l.link}"]`).disabled = true;
  });
  postBtn.disabled = !isReadyToSubmit();
  logEl2.textContent = `${filteredResults.annotatedLinks.length} issues/PRs updated`;
});
