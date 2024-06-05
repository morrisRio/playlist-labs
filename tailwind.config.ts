import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                ibm: "var(--font-ibm)",
            },
            colors: {
                ui: {
                    950: "#121212",
                    900: "#171717",
                    800: "#292929",
                    700: "#3a3a3a",
                    600: "#737373",
                    500: "#999999",
                    400: "#b3b3b3",
                },
                themetext: {
                    DEFAULT: "#ffffff",
                    nerfed: "#f2f2f2",
                },
                invertme: {
                    DEFAULT: "#c9c9c9",
                },
            },
        },
    },
    plugins: [],
};
export default config;
