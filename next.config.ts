import type { NextConfig } from "next";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type { RuleSetRule, Configuration } from 'webpack';
import withPWA from 'next-pwa';

const configWithWebpack: NextConfig = {
  images: {
    domains: ['example.com', 'localhost', 'localhosthttps', 'food-order-api-5crt.onrender.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'food-order-api-5crt.onrender.com',
      },
    ],
  },
  webpack: (config: Configuration, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Only use MiniCssExtractPlugin on the client side in production
    if (!isServer && !dev) {
      // Add MiniCssExtractPlugin to the config
      if (config.plugins) {
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: 'static/css/[contenthash].css',
            chunkFilename: 'static/css/[contenthash].css',
          })
        );
      }
    }
    
    return config;
  }
};

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(configWithWebpack);

export default nextConfig;
