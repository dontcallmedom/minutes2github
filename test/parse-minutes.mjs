import { parseMinutes } from "../lib/parse-minutes.mjs";
import { JSDOM } from "jsdom";
import assert from "assert";
import {HttpServer} from "http-server";

const server = new HttpServer({
  cors: true,
  port: 0,
  logFn: (req, res, err) => {
    // Ignore "not found" errors that some tests generate on purpose
    if (err && err.status !== 404) {
      console.error(err, req.url, req.status);
    }
  }
});

const port = process.env.PORT ?? 8081;

describe("the minutes parser", function() {
  before(async () => {
    server.listen(port);
  });

  it("extract github links from HTML", async function() {
    const dom = await JSDOM.fromURL(`http://localhost:${port}/test/minutes.html`);
    const doc = dom.window.document;
    const results = await parseMinutes(doc, "minutes.html");
    assert.equal(results.length, 4, "Four github link detected in the minute");
    assert.equal(results[0].url, "minutes.html", "URL of minutes in the results");
    assert.equal(results[0].title, "Test Minutes", "Title of minutes in the results");
    assert.equal(results[0].link, "https://github.com/dontcallmedom/minutes2github/issues/1", "Proper link found in the results");
    assert.equal(results[0].type, "mentioned", "Link detected as a simple mention");
    assert.equal(results[0].context.id, "x01", "Proper heading associated to the link found in the results");
    assert.equal(results[1].link, "https://github.com/dontcallmedom/minutes2github/pull/2", "Proper link found in the results");
    assert.equal(results[1].context.id, "x02", "Proper heading associated to the link found in the results");
    assert.equal(results[1].type, "mentioned", "Link detected as a simple mention");
    assert.equal(results[2].link, "https://github.com/gpuweb/gpuweb/issues/3875", "Proper link found in the results");
    assert.equal(results[2].type, "discussed", "Link detected as a discussion item");
    assert.equal(results[2].context.id, "x04", "Proper heading associated to the link found in the results");
    assert.equal(results[3].link, "https://github.com/gpuweb/gpuweb/issues/3812", "Proper link found in the results");
    assert.equal(results[3].type, "mentioned", "Link detected as a discussion item");
    assert.equal(results[3].context?.id, "x04", "Proper heading associated to the link found in the results");
  });

  it("extract github links from HTML and associated PDF slides", async function() {
    const dom = await JSDOM.fromURL(`http://localhost:${port}/test/minutes-with-slides.html`);
    const doc = dom.window.document;
    const results = await parseMinutes(doc, "minutes-with-slides.html");
    assert.equal(results.length, 3, "Three github link detected in the minute");
    assert.equal(results[0].url, "minutes-with-slides.html", "URL of minutes in the results");
    assert.equal(results[0].title, "Test Minutes with PDF slides", "Title of minutes in the results");
    assert.equal(results[0].link, "https://github.com/dontcallmedom/minutes2github/issues/1", "Proper link found in the results");
    assert.equal(results[0].type, "discussed", "Link detected as a discussion topic");
    assert.equal(results[0].context.id, "x00", "Proper heading associated to the link found in the results");
    assert.equal(results[1].link, "https://github.com/dontcallmedom/minutes2github/pull/2", "Proper link found in the results");
    assert.equal(results[2].link, "https://github.com/dontcallmedom/minutes2github/pull/4", "Proper link found in the results (from PDF)");
    assert.equal(results[2].type, "mentioned");
    assert.equal(results[2].context.id, "page=4");
    assert.equal(results[2].url, `http://localhost:${port}/test/slides.pdf`);
  });

  after(async () => {
    server.close();
  });

});
