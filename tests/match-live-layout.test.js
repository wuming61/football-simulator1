const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.ok(!appSource.includes("match-broadcast-strip"), "the redundant live match summary row must stay removed");
assert.ok(!styles.includes(".match-broadcast-strip"), "removed live summary styles must not leave responsive layout rules behind");
assert.match(appSource, /match-priority-grid[\s\S]*renderMatchStats\(m\)[\s\S]*renderFeaturedRatings\(m\)/, "live commentary, match data and ratings must remain prominent");
assert.match(appSource, /class="speed-control"[\s\S]*data-match-speed/, "1x, 2x and 4x playback controls must remain available");

console.log("match live layout tests passed: duplicate summary removed and primary data/playback controls retained");
