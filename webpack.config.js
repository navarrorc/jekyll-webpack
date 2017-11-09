"use strict";

const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;


function resolve(dir) {
    return path.resolve(__dirname, dir);
}

let buildEntryPoint = function (entryPoint) {
    if (process.env.NODE_ENV === "production") {
        // no HMR
        return entryPoint;
    }

    return [
        "webpack-dev-server/client?http://localhost:3000",
        "webpack/hot/only-dev-server",
        entryPoint
    ];
};

/**
 * Common Webpack Configuration
 */
const commonConfig = merge([
    {
        context: resolve("src/app"),
        entry: {
            main: buildEntryPoint("./main.js"),
            // vendor: ["vue", "sp-pnp-js"]
            vendor: ["vue"]
        },
        output: {
            filename: "[name].js",
            // path: resolve("jekyll/_site/dist"),
            path: resolve("jekyll/dist"),
        },
        module: {
            rules: [{
                enforce: "pre",
                test: /\.(js|vue)$/,
                loader: "eslint-loader",
                include: [resolve("src/app")]
            }, {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    preLoaders: { js: "eslint-loader" },
                    extractCSS: true,
                    postcss: () => [require("autoprefixer")], // see: https://vue-loader.vuejs.org/en/features/postcss.html
                    loaders: {
                        // js: "babel-loader", // not needed?
                        css: ["css-hot-loader"].concat(ExtractTextPlugin.extract({
                            fallback: "vue-style-loader", // <- this is a dep of vue-loader, so no need to explicitly install if using npm3
                            use: [
                                {
                                    loader: "css-loader",
                                    options: {
                                        url: false, // will not parse url() in css
                                        importLoaders: 1,
                                        sourceMap: true
                                    }
                                },
                                {
                                    loader: "sass-loader",
                                    options: {
                                        sourceMap: true
                                    }
                                }
                            ]
                        }))
                    }
                }
            }, {
                test: /\.js$/,
                include: [resolve("src/app")],
                use: {
                    loader: "babel-loader"
                }
            }, {
                test: /\.json$/,
                include: [resolve("src")],
                use: {
                    loader: "json-loader"
                }
            }, {
                test: /\.(css|scss)/,
                include: [resolve("src/sass"), resolve("src/app/components")],
                use: ["css-hot-loader"].concat(ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                url: false, // will not parse url() in css
                                importLoaders: 1,
                                sourceMap: true
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: () => [require("autoprefixer")],
                                sourceMap: true
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }))
            }
            ]
        },
        resolve: {
            extensions: [".js", ".vue", ".json"],
            alias: {
                // "vue$": "vue/dist/vue.esm.js", // see: https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
                "@": resolve("src"), // Replace `src` with the path to your source files from the root of your project
                "~": resolve("node_modules")
            },
            symlinks: false
        },
        plugins: [
            new ExtractTextPlugin({
                filename: "css/[name].css",
                // filename: "./css/main.css",
                allChunks: true

            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "vendor"
            }),
            // new BundleAnalyzerPlugin()
        ]
    }
]);

/**
 * Dev Webpack Configuration
 */
const devConfig = merge([
    {
        watch: true,
        output: {
            publicPath: "/dist/"
        },
        devtool: "eval-source-map",
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new BundleAnalyzerPlugin()
        ]
    }
]);

/**
 * Production Webpack Configuration
 */
const prodConfig = merge([
    {
        watch: false,
        devtool: "source-map",
        output: {
            publicPath: "/pages/dist/" // required for SharePoint deployment
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": JSON.stringify("production")
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: true
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessorOptions: {
                    discardComments: { removeAll: true },
                    map: { inline: false }
                },
                canPrint: true
            }),
            new webpack.optimize.ModuleConcatenationPlugin() // webpack 3 feature
        ]
    }
]);

module.exports = (env) => {
    if (env === "production") {
        return merge(commonConfig, prodConfig);
    }

    return merge(commonConfig, devConfig);
};
