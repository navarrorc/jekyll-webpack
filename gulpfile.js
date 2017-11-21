"use strict";

const gulp = require("gulp");
const gutil = require("gulp-util");
const child = require("child_process");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const browserSync = require("browser-sync").create();
const path = require("path");
const runSequence = require("run-sequence");

let webpackConfig = require("./webpack.config.js")(process.env.NODE_ENV);
let isProd = process.env.NODE_ENV === "production";
let jekyll = null;
let first_run = true;

const messages = {
  jekyllBuild: "<span style='color: grey'>Running:</span> $ jekyll build"
};

const statsOptions = {
  colors: true,
  hash: false,
  version: true,
  timings: true,
  assets: true,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: false,
  cached: false,
  reasons: false,
  source: false,
  errorDetails: true,
  chunkOrigins: false,
  displayErrorDetails: true
};

function onBuild() {
  return function(err, stats) {
    if (err) {
      gutil.log("Error", err);
    } else {
      // see: https://webpack.js.org/configuration/stats/
      gutil.log("onBuild", stats.toString(statsOptions));
    }
  };
}

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

/**************
 * Tasks
 **************/

/**
* Process Assets with webpack
*/
gulp.task("webpack", function(done) {
  webpack(webpackConfig, function(err, stats) {
    onBuild()(err, stats);
    done();
  });
});

/**
 * Build the Jekyll Site
 */
gulp.task("jekyll-build", function(done) {
  // see: https://aaronlasseigne.com/2016/02/03/using-gulp-with-jekyll/
  let exec = process.platform === "win32" ? "jekyll.bat" : "jekyll"; // see: http://bit.ly/2pzQeHk
  if (isProd) {
    jekyll = child
      .spawn(exec, [
        "build",
        "--source",
        "jekyll/",
        "--destination",
        "jekyll/_site/",
        // "--incremental",
        "--drafts"
      ])
      .on("close", function() {
        done();
      });
  } else {
    if (!first_run) browserSync.notify(messages.jekyllBuild);

    jekyll = child
      .spawn(exec, [
        "build",
        "--source",
        "jekyll/",
        "--destination",
        "jekyll/_site/",
        // "--incremental",
        "--drafts"
      ])
      .on("close", function() {
        if (!first_run) {
          browserSync.reload();
        }
        done(); // finished task
      });
  }
  let jekyllLogger = function(buffer) {
    buffer
      .toString()
      .split(/\n/)
      .forEach(function(message) {
        if (message) {
          gutil.log("Jekyll: " + message);
        }
      });
  };

  jekyll.stdout.on("data", jekyllLogger);
  jekyll.stderr.on("data", jekyllLogger);
});

gulp.task("serve", function() {
  let options = {
    host: "localhost",
    port: process.env.PORT || 8080,
    proxy: "http://localhost:3000",
    ui: {
      port: 8081
    },
    ghostMode: false,
    open: false
  };
  browserSync.init(options);

  let watcher_all = gulp.watch(
    ["jekyll/**/*", "!jekyll/_site/**/*"],
    ["jekyll-build"]
  );

  watcher_all.on("change", function(event) {
    gutil.log(
      `Watcher: File  ${event.path}  was  ${event.type}  running jekyll-build`
    );
  });
});

gulp.task("clean-dist", function(done) {
  // delete the dist directory
  let rm = child.spawn("rm", ["-rfv", "./jekyll/dist"]).on("close", function() {
    done();
  });

  let rmLogger = function(buffer) {
    buffer
      .toString()
      .split(/\n/)
      .forEach(function(message) {
        if (message) {
          gutil.log("RM Command: " + message);
        }
      });
  };

  rm.stdout.on("data", rmLogger);
  rm.stderr.on("data", rmLogger);
});

gulp.task("build", function() {
  runSequence("clean-dist", "webpack");
});

gulp.task("default", function() {
  runSequence("clean-dist", "jekyll-build", "webpack-dev-server", "serve");
});

gulp.task("webpack-dev-server", function(done) {
  // let myConfig = Object.create(devConfig);
  let myConfig = Object.create(webpackConfig);
  const compiler = webpack(myConfig);
  compiler.plugin("done", function() {
    if (first_run) {
      first_run = false;
      done();
    }

    gutil.log(
      "[webpack-dev-server]",
      "Starting server on http://localhost:3000"
    );
  });

  // Start a webpack-dev-server
  new WebpackDevServer(compiler, {
    publicPath: "http://localhost:3000/dist/",
    contentBase: resolve("jekyll/_site"),
    noInfo: false,
    hot: true,
    open: false,
    inline: true,
    stats: statsOptions,
    overlay: {
      warnings: false,
      errors: true
    }
  }).listen(3000, "localhost", function(err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
  });
});
