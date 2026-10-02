/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
import { mdsvex } from "mdsvex";

export default {
    extensions: [".svelte", ".svx", ".md"],
    preprocess: [
        mdsvex({
            extensions: [".svx", ".md"],
            remarkPlugins: [
                function custom() {

                    type Heading = {
                        text?: string;
                        id?: string;
                        index?: number[];
                        children?: Heading[];
                    };

                    type Tree = {
                        type?:
                        | "root"
                        | "yaml"
                        | "heading"
                        | "paragraph"
                        | "html"
                        | "thematicBreak"
                        | "code"
                        | "text"
                        | "linkReference";
                        value?: string;
                        lang?: "mermaid";
                        depth?: number;
                        children?: Tree[];
                        position?: {
                            start: { line: number };
                        };
                    };

                    function fillLevels(
                        buildIndexesParent: number[],
                        level: Heading[],
                    ) {
                        for (var i = 0; i < buildIndexesParent.length; i++) {
                            const idx = (buildIndexesParent[i] || 1) - 1;
                            if (!level[idx]) level[idx] = { children: [] };
                            level = level[idx].children || [];
                        }
                        return level;
                    }

                    function setIndexes({
                        level,
                        containerIndexes,
                    }: {
                        level: number;
                        containerIndexes: number[];
                    }) {
                        if (!containerIndexes[level]) containerIndexes[level] = 0;
                        containerIndexes[level]++;
                        containerIndexes.splice(level + 1);

                        for (let i = 1; i < containerIndexes.length; i++) {
                            if (typeof containerIndexes[i] !== "number")
                                containerIndexes[i] = 1;
                        }

                        const current = [...containerIndexes.slice(1)];

                        const ancestors = containerIndexes.slice(1, -1);

                        return { current, ancestors };
                    }

                    function makeId(textContent: string) {
                        const slugify = (s: string) =>
                            s
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9\-]/g, "")
                                .replace(/\-+/g, "-")
                                .replace(/^\-+|\-+$/g, "");

                        const base = slugify(textContent);
                        let unique = base;
                        if (typeof usedIds[base] !== "number") {
                            usedIds[base] = 0;
                        } else {
                            usedIds[base]++;
                            unique = `${base}-${usedIds[base]}`;
                        }
                        return unique;
                    }

                    function walk(node: Tree, parent: Tree) {

                        if (node.type === "heading") {

                            let textFromTransformer = "";
                            let allFromTransformer = "";
                            let textContent = "";
                            let preContent = "";

                            node.children?.forEach((child: Tree) => {
                                if (child.type === "text") {
                                    let value = child.value || "";
                                    textFromTransformer += value;
                                    allFromTransformer += value;
                                } else if (child.type === "html") {
                                    if (child.value) {
                                        allFromTransformer += child.value;
                                    }
                                }
                            });

                            const id = makeId(textFromTransformer);

                            const { current, ancestors: indexesAncestorsToc } =
                                setIndexes({
                                    level: node.depth!,
                                    containerIndexes: containerIndexesToc,
                                });
                            const indexCurrentToc = current;

                            fillLevels(indexesAncestorsToc, buildToc).push({
                                text: textFromTransformer,
                                id,
                                index: indexCurrentToc,
                                children: [],
                            });

                            preContent += `<span class="section"><a href="#${id}" class="link" title="Section link"></a></span>`;
                            preContent += `<span class="index">${indexCurrentToc.join(".")}.</span>`;

                            parent.children![parent.children!.indexOf(node)] = {
                                type: "html",
                                value: `<h${node.depth} id="${id}">${preContent}<span class="content">${textContent + allFromTransformer}</span></h${node.depth}>`,
                            };

                        } else if (node.type === "html") {
                            if (/<script>/.test(node.value!)) nodeScript = node;
                        } else if (node.type === "yaml") {
                            nodeYaml = node
                        } else if (node.type === "root") {
                            node.children?.forEach((child) => walk(child, node));
                        }

                    }

                    let nodeYaml: Tree | null = null;
                    const usedIds: Record<string, number> = {};
                    const buildToc: Heading[] = [];
                    let nodeScript: Tree | null = null;
                    const containerIndexesToc: number[] = [];

                    return (tree: Tree) => {

                        walk(tree, {});

                        let tocMarkup = '';
                        let theEnd = '';

                        if (buildToc.length > 1 || buildToc[0]?.children?.length) {
                            tocMarkup = `<div class="container-toc"><I p={import("../svx/Toc.svelte")} list='${JSON.stringify(buildToc).replace(/{/g, "&#123").replace(/}/g, "&#125")}' /></div>`;
                            theEnd = '<div class="the-end" style="text-align:center;padding:1em 0 calc(100vh - 2em);line-height:1">⁂</div>';
                        }

                        tree.children!.splice((nodeScript ? tree.children!.indexOf(nodeScript) : nodeYaml ? tree.children!.indexOf(nodeYaml) : -1) + 1, 0, {
                            type: "html",
                            value: `<div class="body-svx">`,
                        }, {
                            type: "html",
                            value: `${tocMarkup}<div class="container-content${tocMarkup ? " with-toc" : ""}">`,
                        });

                        tree.children!.push({
                            type: "html",
                            value: `${theEnd}</div></div><I p={import("../scroll/Scroll.svelte")} />`,
                        });

                        if (nodeScript) {
                            const scriptContent = nodeScript.value || "";
                            if (!/import\s+I\s+from\s+["']\..\/dynamic\.svelte['"]/.test(scriptContent)) {

                                tree.children![tree.children!.indexOf(nodeScript)] = {
                                    type: "html",
                                    value: scriptContent.replace(/<script>/, `<script>\nimport I from '../dynamic/I.svelte';\n`),
                                };
                            }
                        } else {
                            tree.children!.splice(nodeYaml ? tree.children!.indexOf(nodeYaml) + 1 : 0, 0, {
                                type: "html",
                                value: `<script>\nimport I from '../dynamic/I.svelte';\n</script>`,
                            });
                        }

                        if (nodeYaml) {

                            let headerContent = "";

                            nodeYaml.value!.split("\n").forEach((line) => {
                                const [yamlKey, yamlValue] = line.split(/:(.*)/);
                                if (yamlKey === 'title') {
                                    const value = yamlValue.trim();
                                    const id = makeId(value);
                                    headerContent += `<h1 id="${id}" style="font-weight:bold;text-transform:uppercase">${value}</h1>`
                                } else if (yamlKey === 'subtitle') {
                                    const value = yamlValue.trim();
                                    const id = makeId(value);
                                    headerContent += `<h2 id="${id}" style="font-weight:bold">${value}</h2>`
                                } else if (yamlKey === 'author') {
                                    const value = yamlValue.trim();
                                    headerContent += `<h3 class="author" style="font-weight:bold;font-style:italic">${value}</h3>`;
                                }
                            });

                            tree.children!.splice(tree.children!.indexOf(nodeYaml) + 1, 0,
                                {
                                    type: "html",
                                    value: `<header class="header-svx" style="text-align:center;font-size:min(1em,3vw);line-height:1.25">${headerContent}</header>`
                                })
                        }

                        nodeYaml = null;
                        for (let key in usedIds) delete usedIds[key];
                        buildToc.length = 0;
                        nodeScript = null;
                        containerIndexesToc.length = 0;

                    }
                }
            ]
        }),
        {
            name: "normalize-dynamic-import-quotes",
            markup({ content, filename }: { content: string; filename?: string }) {
                if (!filename?.endsWith(".svx") && !filename?.endsWith(".md")) return;

                return {
                    code: content.replace(
                        /\bimport\(\s*(?:\\?(["'])([^"']*)\\?\1|“([^”]*)”|‘([^’]*)’|\\?`([^`]*)\\?)\s*\)/g,
                        (_match, _quote, doublePath, smartDoublePath, smartSinglePath, backtickPath) => {
                            const path = doublePath ?? smartDoublePath ?? smartSinglePath ?? backtickPath;
                            return "import(`" + path + "`)";
                        },
                    ),
                };
            },
        },
    ]
}
