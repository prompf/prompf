/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
import { mdsvex } from "mdsvex";
import { svxMarkupPreprocessor, svxRemarkPlugin } from "./markup.ts";

export default {
    extensions: [".svelte", ".svx", ".md"],
    preprocess: [
        svxMarkupPreprocessor(),
        mdsvex({
            extensions: [".svx", ".md"],
            remarkPlugins: [svxRemarkPlugin],
        }),
        {
            name: "normalize-dynamic-import-quotes",
            markup({ content, filename }) {
                if (!filename?.endsWith(".svx") && !filename?.endsWith(".md")) return;

                return {
                    code: content.replace(
                        /\bimport\(\s*(?:\\?(["'])([^"']*)\\?\1|“([^”]*)”|‘([^’]*)’|\\?`([^`]*)\\?)\s*\)/g,
                        (_match, _quote, doublePath, smartDoublePath, smartSinglePath, backtickPath) => {
                            const path = doublePath ?? smartDoublePath ?? smartSinglePath ?? backtickPath;
                            return 'import("' + path + '")';
                        },
                    ),
                };
            },
        },
    ],
};
