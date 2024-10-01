// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve("../upward-api/src/view"), // Change 'custom_build_folder' to your desired folder name
      };
      return webpackConfig;
    },
  },
};
