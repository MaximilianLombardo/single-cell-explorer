const chalk = require("chalk");
const fs = require("fs");
const express = require("express");
const favicon = require("serve-favicon");
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const path = require("path");
const config = require("../configuration/webpack/webpack.config.dev");
const utils = require("./utils");

process.env.NODE_ENV = "development";

const CLIENT_PORT = process.env.CXG_CLIENT_PORT;

// Set up compiler
const compiler = webpack(config);

compiler.hooks.invalid.tap("invalid", () => {
  utils.clearConsole();
  console.log("Compiling...");
});

compiler.hooks.done.tap("done", (stats) => {
  utils.formatStats(stats, CLIENT_PORT);
});

// Launch server
const app = express();

const mw = devMiddleware(compiler, {
  publicPath: config.output.publicPath,
  index: true,
  // (thuang): This is needed to ensure obsoleteBrowsers.js
  // is copied to the build/static directory
  writeToDisk: true,
});

// Configure visitUrlMessage
const localUrl = `http://${fs.readFileSync("../.test_base_url.txt")}`;
const fingerPointingRightEmoji = String.fromCodePoint(0x1f449);
const starEmoji = String.fromCodePoint(0x2b50);
const clipboardEmoji = String.fromCodePoint(0x1f4cb);
// pbcopy only works on MacOS ("darwin")
const isCopiedMessage =
  process.platform === "darwin"
    ? `  ${starEmoji} copied to clipboard! ${clipboardEmoji}`
    : "";
const visitUrlMessage = `\n\n${fingerPointingRightEmoji} Visit ${localUrl}${isCopiedMessage}\n`;

// Print url message after a recompile finishes
mw.waitUntilValid(() => {
  console.log(chalk.magenta.bold(visitUrlMessage));
});

app.use(mw);

/*
Serve spatial Deep Zoom tiles, mirroring what the Flask server does when
SPATIAL_DEEP_ZOOM_DIR is set.

The client requests these from a same-origin path, which is correct in production
where one server serves both the app and its assets. In development the client and
API live on different ports, so this dev server has to serve them too -- otherwise
the request lands here on :3000 and 404s.

Build the directory with scripts/spatial_deep_zoom/build_deep_zoom.py.
*/
if (process.env.SPATIAL_DEEP_ZOOM_DIR) {
  app.use(
    "/spatial-deep-zoom",
    express.static(process.env.SPATIAL_DEEP_ZOOM_DIR, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".dzi")) res.type("application/xml");
      },
    })
  );
}

// Serve the built index file from url that allows extraction of the base_url and dataset for api calls
app.get("/:baseUrl/:dataset/", (_, res) => {
  res
    .set("Cache-Control", "no-store") // prevents ERR_CONTENT_LENGTH_MISMATCH
    .sendFile(path.join(path.dirname(__dirname), "build/index.html")); // same location as prod index
});

// Same as above but for datasets located in cellguide-cxgs/ subdirectory
app.get("/:baseUrl/cellguide-cxgs/:dataset", (_, res) => {
  res.sendFile(path.join(path.dirname(__dirname), "build/index.html")); // same location as prod index
});

// Same as above but for datasets located in custom-cxgs/ subdirectory (with user_id path segment)
app.get("/:baseUrl/custom-cxgs/:userId/:dataset", (_, res) => {
  res.sendFile(path.join(path.dirname(__dirname), "build/index.html")); // same location as prod index
});

app.use(express.static("/build"));

app.use(favicon("./favicon.png"));

function mockJS(_, res) {
  res.set("Content-Type", "application/javascript");
  res.send("");
}

app.get("/:baseUrl/static/obsoleteBrowsers.js", mockJS);
app.get("/:baseUrl/:dataset/static/obsoleteBrowsers.js", mockJS);

app.listen(CLIENT_PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  utils.clearConsole();
  console.log(chalk.cyan("Starting the development server..."));
  console.log();
});
