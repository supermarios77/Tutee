module.exports = {
  images: {
    domains: ["images.unsplash.com"], // Add 'images.unsplash.com' to the list of allowed domains
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "/_next/static/sounds/",
          outputPath: "static/sounds/",
        },
      },
    });

    // For handling remote images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [
        {
          loader: "url-loader",
          options: {
            limit: 8192, // Convert images < 8kb to base64 strings
            publicPath: "/_next/static/images/",
            outputPath: "static/images/",
            name: "[name].[hash].[ext]",
          },
        },
      ],
    });

    return config;
  },
};
