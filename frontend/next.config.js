/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "amzn-s3-musify.s3.eu-north-1.amazonaws.com",
            },
            {
                protocol:'https',
                hostname:'commons.wikimedia.org'
            },
            {
                protocol:'https',
                hostname:'upload.wikimedia.org'
            }
        ],
    },
};

export default config;
