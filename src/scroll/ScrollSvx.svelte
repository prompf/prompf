<script lang="ts">
  import { onMount } from "svelte";
  import Style from "./Style.svelte";

  function isTocInViewport(containerNav?: HTMLElement | null) {
    if (!containerNav) return false;
    const containerRect = containerNav.getBoundingClientRect();

    return !(containerRect.top >= -50);
  }

  function setScrolledValueToc() {
    const x = 50,
      y = (window.innerHeight || document.documentElement.clientHeight) - 50;
    const el = document.elementFromPoint(x, y);

    const classNameToc = "toc";
    if (el?.classList.contains(classNameToc)) return el as HTMLElement | null;

    const toc = el?.querySelector(`.${classNameToc}`) as HTMLElement | null;
    toc?.style.setProperty(
      "--scroll-toc-top",
      `${(window.innerWidth || document.documentElement.clientWidth) <= 1200 ? 0 : toc.getBoundingClientRect().top}px`,
    );
  }

  function getElementCurrentContainer(): HTMLElement | null {
    const x = 50,
      y = 50;
    const el = document.elementFromPoint(x, y);

    const classNameSvx = "svx";
    if (el?.classList.contains(classNameSvx)) return el as HTMLElement | null;
    return el?.querySelector(`.${classNameSvx}`) as HTMLElement | null;
  }

  const onWindow = () => {
    setScrolledValueToc();
    showScrollToc = isTocInViewport(getElementCurrentContainer());
  };

  const triggerOnScrollWindow = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  let showScrollToc = $state(false);

  onMount(() => {
    window.addEventListener("scroll", onWindow);
    window.addEventListener("resize", onWindow);
    getElementCurrentContainer()?.addEventListener(
      "scroll",
      triggerOnScrollWindow,
    );

    return () => {
      window.removeEventListener("scroll", onWindow);
      window.removeEventListener("resize", onWindow);
      getElementCurrentContainer()?.removeEventListener(
        "scroll",
        triggerOnScrollWindow,
      );
    };
  });
</script>

<Style />

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
        getElementCurrentContainer()?.scrollIntoView();
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
