module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ["module-resolver", {
                alias: {
                    "@App": "./app",
                    "@Assets": "./assets",
                    "@Components": "./components",
                    "@Constants": "./constants",
                    "@Context": "./context",
                    "@Hooks": "./hooks",
                    "@Scripts": "./scripts",
                    "@Firebase": "./firebaseConfig" // assuming it's at the root
                },
                extensions: [".js", ".jsx", ".ts", ".tsx"]
            }]
        ]
    };
};