<script lang="ts">
  import Loading from "../loading/Loading.svelte";
  import type { Component } from "svelte";

  const {
    p,
    componentName,
    loadingText,
    ...props
  }: {
    p: Promise<{ default: Component<any> }>;
    componentName?: string;
    loadingText?: string;
  } & Record<string, any> = $props();
</script>

{#await p}
  <Loading text={loadingText} />
{:then Module}
  {#if typeof props.children === "function"}
    {@const { children, ...rest } = props}
    <Module.default {...rest}>
      {@render children()}
    </Module.default>
  {:else}
    <Module.default {...props} />
  {/if}
{:catch error}
  <small style:color="#d32f2f">{error.message}</small>
{/await}
