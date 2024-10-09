/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
        serverComponentsExternalPackages: ["@napi-rs/canvas"],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "mosaic.scdn.co",
            },
            {
                protocol: "https",
                hostname: "image-cdn-ak.spotifycdn.com",
            },
            {
                protocol: "https",
                hostname: "image-cdn-fa.spotifycdn.com",
            },
            {
                protocol: "https",
                hostname: "i.scdn.co",
            },
        ],
    },
    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components using SVGR
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] }, // exclude if *.svg?url
                use: ["@svgr/webpack"],
            }
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        return config;
    },
};

export default nextConfig;
