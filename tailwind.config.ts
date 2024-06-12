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
                    950: "#000000", //bg
                    900: "#000202", //card
                    800: "#1F1F1F", //bg-rule input-bg
                    700: "#333333", //border
                    650: "#4D4D4D", //tags
                    600: "#878787", //desc text
                    500: "#BEBEBE", //slider progress
                    400: "#b6b6b6", //light-interact
                },
                themetext: {
                    DEFAULT: "#EDEDED",
                    nerfed: "#f2f2f2",
                },
                invertme: {
                    DEFAULT: "#a8a8a8",
                },
            },
        },
    },
    plugins: [],
};
export default config;
