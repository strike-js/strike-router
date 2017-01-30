module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "strikejs-router.min.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    externals:{
        "react":"React",
        "react-dom":"ReactDOM",
        "bluebird":"Promise"
    }
}