// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve("../Application",(process.env.REACT_APP_DEPARTMENT).toString().toLocaleLowerCase() || "build"), // Change 'custom_build_folder' to your desired folder name
      };
      return webpackConfig;
    },
  },
};
