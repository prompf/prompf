<script lang="ts">
    import { onMount } from "svelte";

    function setScrolledTocTopValue() {
        const windowWidth =
            window.innerWidth || document.documentElement.clientWidth;
        if (windowWidth <= 1200) return;

        const x = windowWidth / 2 - 400,
            y =
                (window.innerHeight || document.documentElement.clientHeight) -
                20;
        const el = document.elementFromPoint(x, y);

        const classNameToc = "toc";
        if (el?.classList.contains(classNameToc))
            return el as HTMLElement | null;

        const toc = (el?.querySelector(`.${classNameToc}`) ||
            el?.closest(`.${classNameToc}`)) as HTMLElement | null;
        toc?.style.setProperty(
            "--scroll-toc-top",
            `${toc.getBoundingClientRect().top}px`,
        );
    }

    function isPageTop() {
        return (
            document.body.scrollTop > 50 ||
            document.documentElement.scrollTop > 50
        );
    }

    function isSvxTop(containerNav?: HTMLElement | null) {
        if (!containerNav) return false;
        const containerRect = containerNav.getBoundingClientRect();

        return !(containerRect.top >= -50);
    }

    function getSvxEl(): HTMLElement | null {
        const x =
                (window.innerWidth || document.documentElement.clientWidth) / 2,
            y = 50;
        const el = document.elementFromPoint(x, y);

        const classNameSvx = "svx";
        if (el?.classList.contains(classNameSvx))
            return el as HTMLElement | null;
        return (el?.querySelector(`.${classNameSvx}`) ||
            el?.closest(`.${classNameSvx}`)) as HTMLElement | null;
    }

    const onWindow = () => {
        setScrolledTocTopValue();
        showScrollToSvxTop = isSvxTop(getSvxEl());
        showScrollPageTop = isPageTop();
    };

    const triggerOnScrollWindow = () => {
        window.dispatchEvent(new Event("scroll"));
    };

    let showScrollToSvxTop = $state(false);
    let showScrollPageTop = $state(false);

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

{#if showScrollToSvxTop}
    <div class="button-scroll">
        <button
            title="Jump to the top of the current page"
            type="button"
            onpointerdown={() => {
                window.history.replaceState(
                    null,
                    "",
                    window.location.pathname + window.location.search,
                );
                getSvxEl()?.scrollIntoView();
            }}
        >
            <span class="symbol">↑</span>
        </button>
    </div>
{:else if showScrollPageTop}
    <div class="button-scroll">
        <button
            title="Jump to the top of the window"
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
            <span class="symbol">⤒</span>
        </button>
    </div>
{/if}

<style>
    .button-scroll {
        position: fixed;
        bottom: 1rem;
        right: 0.5rem;
        z-index: 100;

        button {
            background-color: transparent;
            border: none;
            color: inherit;
            cursor: pointer;
            transition: opacity 400ms;
            opacity: 0.5;
            font-family: monospace;
            font-size: inherit;

            &:hover {
                opacity: 1;
            }

            .symbol {
                font-size: inherit;
                line-height: 1rem;
                display: block;
            }
        }
    }
</style>
