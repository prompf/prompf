<script lang="ts">
  import { onMount } from "svelte";

  const { text, delay = 1500 }: { text?: string; delay?: number } = $props();

  let show = $state(false);

  onMount(() => {
    setTimeout(() => (show = true), delay);
  });
</script>

{#if show}
  <span>{typeof text === "string" ? text : "Loading"}</span>
{/if}

<style>
  span::after {
    content: "...";
    animation: dots 1s linear infinite;
    display: inline-block;
    min-width: 1.75ch;
  }

  @keyframes dots {
    0%,
    20% {
      content: "";
    }

    40% {
      content: ".";
    }

    60% {
      content: "..";
    }

    80%,
    100% {
      content: "...";
    }
  }
</style>
