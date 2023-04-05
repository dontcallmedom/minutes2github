import {githubRe} from "./github-link-pattern.mjs";
import {PDFExtract} from "pdf.js-extract";
const pdfExtract = new PDFExtract();


export async function parsePDF(buffer, url) {
  const { meta, pages } = await pdfExtract.extractBuffer(buffer);
  const filename = url?.split("/")?.pop() || ".pdf";
  const title = meta.info?.Title ?? ((meta.metadata ? meta.metadata["dc:title"] : filename) || filename); // TODO use filename part of the url
  const annotatedLinks = [];
  for (const p of pages) {
    const context = {id: "page=" + p.pageInfo.num, title: "Page " + p.pageInfo.num};
    for (const link of p.links.filter(l => l.match(githubRe))) {
      annotatedLinks.push({link, context, type: "mentioned", title, url});
    }
  }
  return annotatedLinks;
}
