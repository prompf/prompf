<script lang="ts">
    import { onMount } from "svelte";
    import { availableVersions, getCommitInfo, loadVersion } from ".";
    import Loading from "../loading/Loading.svelte";

    let selected: string = $state(availableVersions.at(-1) ?? "");
    let commitTimes: Record<string, string> = $state({});
    let commitUrls: Record<string, string> = $state({});
    let props = { label: "Click me" };

    onMount(() => {
        for (const version of availableVersions) {
            getCommitInfo(`v${version}`)
                .then(({ time, url }) => {
                    commitTimes[version] = new Date(time).toLocaleString();
                    commitUrls[version] = url;
                })
                .catch(() => {});
        }
    });
</script>

{#if availableVersions.length > 1}
    <p style="text-align:center">
        <label>
            Timeline: <select name="timeline" bind:value={selected}>
                {#each availableVersions as v (v)}
                    <option value={v}
                        >{v}.{commitTimes[v]
                            ? ` ${commitTimes[v]}`
                            : ""}</option
                    >
                {/each}
            </select>
        </label>
        {#if commitUrls[selected]}
            <a href={commitUrls[selected]} aria-label="View selected commit"
                >🔗︎</a
            >
        {/if}
    </p>
{/if}

{#await loadVersion(selected)}
    <Loading />
{:then Component}
    <Component {...props} />
{:catch err}
    <p style="color:#d32f2f">Could not load version: {err.message}</p>
{/await}

<style>
    a {
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
    label {
        font-variant: all-small-caps;
        font-size: x-large;
    }
</style>
