import { parseMinutes } from "../lib/parse-minutes.mjs";
import { JSDOM } from "jsdom";
import assert from "assert";

describe("the minutes parser", function() {
  it("extract github links from HTML", async function() {
    const dom = await JSDOM.fromFile("test/minutes.html");
    const doc = dom.window.document;
    const results = parseMinutes(doc, "minutes.html");
    assert(results.length === 2, "One github link detected in the minute");
    assert(results[0].url === "minutes.html", "URL of minutes in the results");
    assert(results[0].title === "Test Minutes", "Title of minutes in the results");
    assert(results[0].link === "https://github.com/dontcallmedom/minutes2github/issues/1", "Proper link found in the results");
    assert(results[0].context.id === "x01", "Proper heading associated to the link found in the results");
    assert(results[1].url === "minutes.html", "URL of minutes in the results");
    assert(results[1].title === "Test Minutes", "Title of minutes in the results");
    assert(results[1].link === "https://github.com/dontcallmedom/minutes2github/pull/2", "Proper link found in the results");
    assert(results[1].context.id === "x02", "Proper heading associated to the link found in the results");
  });
});
