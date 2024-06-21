/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
