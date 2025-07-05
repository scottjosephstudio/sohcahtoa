/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep existing strict mode setting
  reactStrictMode: true,

  // Enable standalone output for Docker deployment
  output: "standalone",

  // Keep styled-components compiler configuration
  compiler: {
    styledComponents: true,
  },

  // Keep existing webpack configuration for fonts
  webpack(config) {
    // Add alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
    };

    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: "asset/resource",
      generator: {
        filename: "static/fonts/[name][ext]",
      },
    });
    return config;
  },

  // Add Turbopack configuration
  experimental: {
    // Enable Turbopack for development
    turbo: {
      // Add alias configuration for Turbopack
      resolveAlias: {
        '@': '.',
      },
      // Turbopack rules for similar font handling
      rules: {
        // This helps Turbopack handle fonts similarly to your webpack config
        "**/*.{woff,woff2,eot,ttf,otf}": [
          {
            loader: "file-loader",
            options: {
              name: "static/fonts/[name][ext]",
            },
          },
        ],
      },
    },
  },
};

module.exports = nextConfig;
