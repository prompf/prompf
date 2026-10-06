<script lang="ts">
  import { onMount } from "svelte";
  import Style from "./Style.svelte";

  function isSvxInViewport(containerNav?: HTMLElement | null) {
    if (!containerNav) return false;
    const containerRect = containerNav.getBoundingClientRect();

    return !(containerRect.top >= -50);
  }

  function setScrolledValueToc() {
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    if (windowWidth <= 1200) return;

    const x = windowWidth / 2 - 400,
      y = (window.innerHeight || document.documentElement.clientHeight) - 20;
    const el = document.elementFromPoint(x, y);

    const classNameToc = "toc";
    if (el?.classList.contains(classNameToc)) return el as HTMLElement | null;

    const toc = (el?.querySelector(`.${classNameToc}`) ||
      el?.closest(`.${classNameToc}`)) as HTMLElement | null;
    toc?.style.setProperty(
      "--scroll-toc-top",
      `${toc.getBoundingClientRect().top}px`,
    );
  }

  function getElementCurrentContainer(): HTMLElement | null {
    const x = (window.innerWidth || document.documentElement.clientWidth) / 2,
      y = 50;
    const el = document.elementFromPoint(x, y);

    const classNameSvx = "svx";
    if (el?.classList.contains(classNameSvx)) return el as HTMLElement | null;
    return (el?.querySelector(`.${classNameSvx}`) ||
      el?.closest(`.${classNameSvx}`)) as HTMLElement | null;
  }

  const onWindow = () => {
    setScrolledValueToc();
    showScrollToc = isSvxInViewport(getElementCurrentContainer());
  };

  const triggerOnScrollWindow = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  let showScrollToc = $state(false);

  onMount(() => {
    window.addEventListener("scroll", onWindow);
    window.addEventListener("resize", onWindow);
    document.querySelectorAll(".svx").forEach((el) => {
      el.addEventListener("scroll", triggerOnScrollWindow);
    });

    return () => {
      window.removeEventListener("scroll", onWindow);
      window.removeEventListener("resize", onWindow);
      document.querySelectorAll(".svx").forEach((el) => {
        el.removeEventListener("scroll", triggerOnScrollWindow);
      });
    };
  });
</script>

<Style />

<!-- <div
  style="position: fixed; top: {(window.innerHeight ||
    document.documentElement.clientHeight) - 20}px; left: {(window.innerWidth ||
    document.documentElement.clientWidth) /
    2 -
    400}px; z-index: -1; border: 5px solid red;"
></div> -->

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
