<script lang="ts">
  import { onMount } from "svelte";
  import GlobalStyle from "./GlobalStyle.svelte";

  function isTocInViewport(containerNav?: HTMLElement | null) {
    if (!containerNav) return false;

    const containerRect = containerNav.getBoundingClientRect();

    const titleRect = containerNav
      .querySelector(".title")
      ?.getBoundingClientRect();
    if (!titleRect) return false;
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    const scrollTocTop = windowWidth <= 1200 ? 0 : containerRect.top;
    containerNav.style.setProperty("--scroll-toc-top", `${scrollTocTop}px`);

    return !(
      titleRect.top - scrollTocTop >= -30 &&
      titleRect.left >= 0 &&
      titleRect.bottom <= windowHeight + 30 &&
      titleRect.right <= windowWidth
    );
  }

  const onWindow = () => {
    showScrollToc = isTocInViewport(
      <HTMLElement | null>document.querySelector(".container-toc"),
    );
  };

  const triggerOnScrollWindow = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  let showScrollToc = $state(false);

  onMount(() => {
    window.addEventListener("scroll", onWindow);
    window.addEventListener("resize", onWindow);
    document
      .querySelector(".container-toc")
      ?.addEventListener("scroll", triggerOnScrollWindow);

    return () => {
      window.removeEventListener("scroll", onWindow);
      window.removeEventListener("resize", onWindow);
      document
        .querySelector(".container-toc")
        ?.removeEventListener("scroll", triggerOnScrollWindow);
    };
  });
</script>

<GlobalStyle />

{#if showScrollToc}
  <div class="button-scroll toc">
    <button
      title="Jump to the prompfs menu"
      type="button"
      onpointerdown={() => {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
        document.querySelector(".container-toc .title")?.scrollIntoView();
      }}
    >
      <span class="symbol">▛</span>
    </button>
  </div>
{/if}

<style>
  .toc {
    right: 2rem;
  }
</style>
