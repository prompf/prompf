import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export type Heading = {
    text?: string;
    id?: string;
    index?: number[];
    children?: Heading[];
};

export type Tree = {
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

const ROOT_DIR = path.resolve(process.cwd());
const GENERATED_DIR = path.resolve(ROOT_DIR, "generated");
const TARGET_I_PATH = path.resolve(ROOT_DIR, "src/dynamic/I.svelte");

/**
 * Returns the corresponding path inside the `generated/` directory for a given source file,
 * preserving directory structure and file name without any appended suffixes.
 *
 * e.g. src/content/Content2.svx -> generated/src/content/Content2.svx
 *      Content0.svx             -> generated/Content0.svx
 */
export function getGeneratedPath(sourceFilePath: string): string {
    const absPath = path.resolve(sourceFilePath);
    const rel = path.relative(ROOT_DIR, absPath);
    return path.resolve(GENERATED_DIR, rel);
}

/**
 * Recursively removes empty directories upwards until stopDir is reached.
 */
export function cleanEmptyDirs(dir: string, stopDir: string): void {
    const normalizedDir = path.resolve(dir);
    const normalizedStop = path.resolve(stopDir);
    if (!normalizedDir.startsWith(normalizedStop) || normalizedDir === normalizedStop) {
        return;
    }
    try {
        if (!fs.existsSync(normalizedDir)) return;
        const entries = fs.readdirSync(normalizedDir);
        if (entries.length === 0) {
            fs.rmdirSync(normalizedDir);
            cleanEmptyDirs(path.dirname(normalizedDir), normalizedStop);
        }
    } catch { }
}

/**
 * Scans the `generated/` directory and removes any generated file whose
 * corresponding main file was deleted, renamed, or no longer has .svx inclusions.
 */
export function cleanupOrphanGeneratedFiles(): void {
    if (!fs.existsSync(GENERATED_DIR)) return;

    function walkDir(dir: string): void {
        let entries: fs.Dirent[] = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath);
                cleanEmptyDirs(fullPath, GENERATED_DIR);
            } else if (entry.isFile()) {
                const rel = path.relative(GENERATED_DIR, fullPath);
                const sourceFile = path.resolve(ROOT_DIR, rel);
                let shouldDelete = false;

                if (!fs.existsSync(sourceFile)) {
                    shouldDelete = true;
                } else {
                    try {
                        const content = fs.readFileSync(sourceFile, "utf-8");
                        const importRegex = /<I\s+[^>]*?p=\{import\(\s*(?:['"`](.*?)['"`]|“([^”]+)”|‘([^’]+)’)\s*\)\}[^>]*?\/>/;
                        if (!importRegex.test(content)) {
                            shouldDelete = true;
                        }
                    } catch {
                        shouldDelete = true;
                    }
                }

                if (shouldDelete) {
                    try {
                        fs.rmSync(fullPath, { force: true });
                        cleanEmptyDirs(dir, GENERATED_DIR);
                    } catch { }
                }
            }
        }
    }

    walkDir(GENERATED_DIR);
}

function getRelativeImportPath(fromFilePath: string, targetFilePath: string): string {
    const fromDir = path.dirname(path.resolve(fromFilePath));
    let rel = path.relative(fromDir, path.resolve(targetFilePath)).split(path.sep).join("/");
    if (!rel.startsWith("./") && !rel.startsWith("../")) {
        rel = "./" + rel;
    }
    return rel;
}

/**
 * Remark plugin for mdsvex that transforms headings, adds section links,
 * generates hierarchical TOCs, and wraps the content in .body layout.
 */
export function svxRemarkPlugin() {
    function fillLevels(buildIndexesParent: number[], level: Heading[]) {
        for (let i = 0; i < buildIndexesParent.length; i++) {
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

    function getNavLevel(items: Heading[]): string {
        let buildLevel = ''
        if (!items.length) return buildLevel

        buildLevel += '<ol class="list">'
        items.forEach(({ id, index, text, children = [] }) => {
            const indent = (index?.length || 1) - 1
            buildLevel += `<li style="--indent:${indent}">`
            if (text && id) buildLevel += `<a href="/#${id}"><span class="section"></span><span class="index">${index?.join(".")}.</span><span class="label">${text}</span></a>`
            buildLevel += getNavLevel(children)
            buildLevel += '</li>'
        })
        buildLevel += '</ol>'
        return buildLevel
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
            if (/<script[\s>]/.test(node.value!)) nodeScript = node;
        } else if (node.type === "yaml") {
            nodeYaml = node;
        } else if (node.type === "root") {
            node.children?.forEach((child) => walk(child, node));
        }
    }

    let nodeYaml: Tree | null = null;
    const usedIds: Record<string, number> = {};
    const buildToc: Heading[] = [];
    let nodeScript: Tree | null = null;
    const containerIndexesToc: number[] = [];

    return (tree: Tree, file?: any) => {
        const currentFile = file?.filename;
        const iImportPath = currentFile
            ? getRelativeImportPath(currentFile, TARGET_I_PATH)
            : "./dynamic/I.svelte";

        walk(tree, {});

        if (nodeScript) {
            const scriptContent = nodeScript.value || "";
            if (!/import\s+I\s+from\s+["'].*?dynamic\/I\.svelte["']/.test(scriptContent)) {
                tree.children![tree.children!.indexOf(nodeScript)] = {
                    type: "html",
                    value: scriptContent.replace(/<script(\s+lang=["']ts["'])?>/, `<script lang="ts">\nimport I from "${iImportPath}";\n`),
                };
            }
        } else {
            tree.children!.splice(0, 0, {
                type: "html",
                value: `<script lang="ts">\nimport I from "${iImportPath}";\n</script>`,
            });
        }

        let headerContent = "";

        if (nodeYaml) {

            nodeYaml.value!.split("\n").forEach((line) => {
                const [yamlKey, yamlValue] = line.split(/:(.*)/);
                if (yamlKey === "title") {
                    const value = yamlValue.trim();
                    const id = makeId(value);
                    headerContent += `<h1 class="title" id="${id}">${value}</h1>`;
                } else if (yamlKey === "subtitle") {
                    const value = yamlValue.trim();
                    const id = makeId(value);
                    headerContent += `<h2 class="subtitle" id="${id}">${value}</h2>`;
                } else if (yamlKey === "author") {
                    const value = yamlValue.trim();
                    headerContent += `<h3 class="author">${value}</h3>`;
                }
            });

            headerContent = `<header>${headerContent}</header>`

        }

        let tocMarkup = "";
        let theEnd = "";

        if (buildToc.length > 1 || buildToc[0]?.children?.length) {
            tocMarkup = `<div class="toc"><nav><h1 class="title"><a onclick={(event)=>{event.preventDefault();window.history.replaceState(null,"",window.location.pathname+window.location.search);event.currentTarget.closest(".svx")?.scrollIntoView();}} href="/">Prompfs</a></h1>${getNavLevel(buildToc)}</nav></div>`;
            theEnd = `<div class="the-end">⁂</div>`;
        }

        tree.children!.splice(
            (nodeScript ? tree.children!.indexOf(nodeScript) : nodeYaml ? tree.children!.indexOf(nodeYaml) : -1) + 1,
            0,
            {
                type: "html",
                value: `<div class="svx">${headerContent}<div class="body">${tocMarkup}<div class="content">`,
            },
        );

        tree.children!.push({
            type: "html",
            value: `${theEnd}</div></div></div>`,
        });

        nodeYaml = null;
        for (const key in usedIds) delete usedIds[key];
        buildToc.length = 0;
        nodeScript = null;
        containerIndexesToc.length = 0;
    };
}

/**
 * Preprocessor that combines multi-file SVX inclusions into unified markup,
 * writes the generated markup within `generated/<relativePath>`,
 * and feeds the combined markdown directly to mdsvex.
 */
export function svxMarkupPreprocessor() {
    return {
        name: "svx-markup-generator",
        markup({ content, filename }: { content: string; filename?: string }) {
            if (!filename || (!filename.endsWith(".svx") && !filename.endsWith(".md"))) {
                return;
            }

            const absFilename = path.resolve(filename);
            // Never re-process files inside the generated directory
            if (absFilename.startsWith(GENERATED_DIR)) {
                return;
            }

            cleanupOrphanGeneratedFiles();

            const importRegex = /<I\s+[^>]*?p=\{import\(\s*(?:['"`](.*?)['"`]|“([^”]+)”|‘([^’]+)’)\s*\)\}[^>]*?\/>/g;
            if (!importRegex.test(content)) {
                // If this file does not have imports, ensure any stale generated file is deleted
                const staleGenerated = getGeneratedPath(filename);
                if (fs.existsSync(staleGenerated)) {
                    try {
                        fs.rmSync(staleGenerated, { force: true });
                        cleanEmptyDirs(path.dirname(staleGenerated), GENERATED_DIR);
                    } catch { }
                }
                return;
            }

            importRegex.lastIndex = 0;
            const dependencies: string[] = [];
            let hasSvxImports = false;

            const combinedCode = content.replace(importRegex, (match, p1, p2, p3) => {
                const importPath = p1 ?? p2 ?? p3;
                if (!importPath || (!importPath.endsWith(".svx") && !importPath.endsWith(".md"))) {
                    return match;
                }

                hasSvxImports = true;
                const resolvedPath = path.resolve(path.dirname(filename), importPath);
                dependencies.push(resolvedPath);

                if (!fs.existsSync(resolvedPath)) {
                    return match;
                }

                let childContent = fs.readFileSync(resolvedPath, "utf-8");
                // Strip frontmatter from child files if present
                childContent = childContent.replace(/^---[\s\S]*?---\r?\n?/, "");
                return childContent.trim();
            });

            if (!hasSvxImports) {
                return;
            }

            // Write the combined markup to generated/<relativeSourcePath>
            const generatedPath = getGeneratedPath(filename);
            try {
                fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
                fs.writeFileSync(generatedPath, combinedCode, "utf-8");
            } catch (err) {
                console.error(`Failed to write generated markup to ${generatedPath}:`, err);
            }

            return {
                code: combinedCode,
                dependencies,
            };
        },
    };
}

/**
 * Vite plugin that watches for file deletions or renames and immediately
 * removes the corresponding generated file in `generated/`.
 */
export function svxGeneratedCleanerPlugin(): Plugin {
    return {
        name: "svx-generated-cleaner",
        buildStart() {
            cleanupOrphanGeneratedFiles();
        },
        watchChange(id, change) {
            if (change.event === "delete") {
                const genPath = getGeneratedPath(id);
                if (fs.existsSync(genPath)) {
                    try {
                        fs.rmSync(genPath, { force: true });
                        cleanEmptyDirs(path.dirname(genPath), GENERATED_DIR);
                    } catch { }
                }
            }
        },
        configureServer(server) {
            server.watcher.on("unlink", (file) => {
                const genPath = getGeneratedPath(file);
                if (fs.existsSync(genPath)) {
                    try {
                        fs.rmSync(genPath, { force: true });
                        cleanEmptyDirs(path.dirname(genPath), GENERATED_DIR);
                    } catch { }
                }
            });
            server.watcher.on("unlinkDir", (dir) => {
                const genDir = getGeneratedPath(dir);
                if (fs.existsSync(genDir)) {
                    try {
                        fs.rmSync(genDir, { recursive: true, force: true });
                        cleanEmptyDirs(path.dirname(genDir), GENERATED_DIR);
                    } catch { }
                }
            });
        },
    };
}
