"use strict";

const gulp = require("gulp");
const gutil = require("gulp-util");
const child = require("child_process");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const browserSync = require("browser-sync").create();
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const runSequence = require("run-sequence");

let webpackConfig = require("./webpack.config.js")(process.env.NODE_ENV);
let isProd = process.env.NODE_ENV === "production";
let jekyll = null;
let first_run = true;

const messages = {
    jekyllBuild: "<span style=\"color: grey\">Running:</span> $ jekyll build"
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
    return function (err, stats) {
        if (err) {
            gutil.log("Error", err);
        }
        else {
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
* Process JS with webpack
*/
gulp.task("webpack", function (done) {
    webpack(webpackConfig, function (err, stats) {
        onBuild()(err, stats);
        done();
    });
});

/**
 * Rename all index.html files to default.aspx
 */
gulp.task("rename", function (done) {
    glob("./jekyll/_site/**/*index.html", {}, function (er, files) {
        gutil.log(JSON.stringify(files, null, 4));
        files.forEach(function (file_path) {
            let dir = file_path.substr(0, file_path.lastIndexOf("/") + 1);
            fs.rename(`${dir}index.html`, `${dir}default.aspx`, function (err) {
                if (err) {
                    gutil.log("ERROR: " + err);
                    throw err;
                }
            });
        });
        gutil.log("Rename: All index.html renamed.");
        done();
    });
});

/**
 * Build the Jekyll Site
 */
gulp.task("jekyll-build", function (done) {
    // see: https://aaronlasseigne.com/2016/02/03/using-gulp-with-jekyll/
    let exec = process.platform === "win32" ? "jekyll.bat" : "jekyll"; // see: http://bit.ly/2pzQeHk
    if (isProd) {
        jekyll = child.spawn(exec, ["build", "--source", "jekyll/", "--destination", "jekyll/_site/","--incremental", "--drafts"])
            .on("close", function () {
                done();
            });
    }
    else {
        if (!first_run) browserSync.notify(messages.jekyllBuild);

        jekyll = child.spawn(exec, ["build", "--source", "jekyll/", "--destination", "jekyll/_site/", "--incremental", "--drafts"])
            .on("close", function () {
                if (!first_run) {
                    browserSync.reload();
                }
                done(); // finished task
            });
    }
    let jekyllLogger = function (buffer) {
        buffer.toString()
            .split(/\n/)
            .forEach(function (message) {
                if (message) {
                    gutil.log("Jekyll: " + message);
                }
            });
    };

    jekyll.stdout.on("data", jekyllLogger);
    jekyll.stderr.on("data", jekyllLogger);
});

gulp.task("serve", function () {
    let options = {
        host: "localhost",
        port: process.env.PORT || 8080,
        proxy: "http://localhost:3000",
        ui: {
            port: 8081
        },
        ghostMode: false,
        open: false,
        // https: {
        //     pfx: "./ssl/localhost-spo-dev.pfx",
        //     passphrase: "spodev"
        // }
    };
    browserSync.init(options);

    let watcher_all = gulp.watch([
        // "*.html",
        // "*.md",
        "jekyll/pages/**/*.html",
        "jekyll/_layouts/*",
        "jekyll/_includes/*",
        "jekyll/_posts/*",
        "jekyll/_data/*",
        "jekyll/_sets/*",
        "jekyll/_drafts/*"], ["jekyll-build"]);

    watcher_all.on("change", function (event) {
        gutil.log(`Watcher: File  ${event.path}  was  ${event.type}  running jekyll-build`);
    });
});

gulp.task("build", function () {
    // runSequence("jekyll-build", "webpack");
    // runSequence("webpack", "jekyll-build");
    runSequence("webpack");
});

gulp.task("build-sp", function () {
    // build for SharePoint, replaces all index.html to default.aspx
    runSequence("webpack", "jekyll-build", "rename");
});

gulp.task("default", function () {
    runSequence("jekyll-build", "webpack-dev-server", "serve");
});

gulp.task("webpack-dev-server", function (done) {
    // let myConfig = Object.create(devConfig);
    let myConfig = Object.create(webpackConfig);
    const compiler = webpack(myConfig);
    compiler.plugin("done", function () {
        if (first_run) {
            first_run = false;
            done();
        }

        gutil.log("[webpack-dev-server]", "Starting server on http://localhost:3000");
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
        },
        // https: true,
        // pfx: fs.readFileSync("./ssl/localhost-spo-dev.pfx"),
        // pfxPassphrase: "spodev"
    }).listen(3000, "localhost", function (err) {
        if (err) throw new gutil.PluginError("webpack-dev-server", err);
    });
});