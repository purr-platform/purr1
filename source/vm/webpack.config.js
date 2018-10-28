const path = require("path");

module.exports = {
  entry: "./purrvm.fsproj",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../../build"),
    filename: "purr-vm.js"
  },
  module: {
    rules: [
      {
        test: /\.fs(x|proj)?/,
        use: "fable-loader"
      }
    ]
  }
};
