import { parseMinutes } from "../lib/parse-minutes.mjs";
import { JSDOM } from "jsdom";
import assert from "assert";

describe("the minutes parser", function() {
  it("extract github links from HTML", async function() {
    const dom = await JSDOM.fromFile("test/minutes.html");
    const doc = dom.window.document;
    const results = parseMinutes(doc, "minutes.html");
    assert.equal(results.length, 3, "Three github link detected in the minute");
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

  });
});
