<script lang="ts">
  import { onMount } from "svelte";
  import Style from "./Style.svelte";

  function isPageTop() {
    return (
      document.body.scrollTop > 50 || document.documentElement.scrollTop > 50
    );
  }

  const onScrollWindow = () => {
    showScrollTop = isPageTop();
  };

  let showScrollTop = $state(false);

  onMount(() => {
    window.addEventListener("scroll", onScrollWindow);

    return () => {
      window.removeEventListener("scroll", onScrollWindow);
    };
  });
</script>

<Style />

{#if showScrollTop}
  <div class="button-scroll top">
    <button
      title="Jump to the top of the page"
      type="button"
      onpointerdown={() => {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }}
    >
      <span class="symbol">█</span>
    </button>
  </div>
{/if}

<style>
  .top {
    right: 0.5rem;
  }
</style>
