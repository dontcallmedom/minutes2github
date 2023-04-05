import { parsePDF } from "../lib/parse-pdf.mjs";
import assert from "assert";
import fs from "fs";

describe("the PDF parser", function() {
  it("extracts github links from PDF", async function() {
    const buffer = fs.readFileSync("test/slides.pdf");
    const results = await parsePDF(buffer, "test/slides.pdf");
    assert.equal(results.length, 2, "Two github link detected in the PDF");
    assert.equal(results[0].url, "test/slides.pdf", "URL of PDF in the results");
    assert.equal(results[0].title, "Untitled presentation", "Title of PDF in the results");
    assert.equal(results[0].link, "https://github.com/dontcallmedom/minutes2github/issues/1", "Proper link found in the results");
    assert.equal(results[0].type, "mentioned", "Link detected as a simple mention");
    assert.equal(results[0].context.id, "page=2", "Proper page associated to the link found in the results");
    assert.equal(results[1].link, "https://github.com/dontcallmedom/minutes2github/pull/4", "Proper link found in the results");
    assert.equal(results[1].context.id, "page=4", "Proper page associated to the link found in the results");
  });
});
