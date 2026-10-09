<script lang="ts">
    import {
        Fallback,
        Link,
        LinkContext,
        Route,
        Router,
    } from "@svelte-router/core";
    import NotFound from "../notFound/NotFound.svelte";
    import TheAlignmentGame from "../theAlignmentGame/TheAlignmentGame.svx";
    import Play from "../play/Play.svx";
    import Prompf from "../../PROMPF.svx";
    import Legal from "../legal/Legal.svelte";
</script>

<Router id="root-router">
    <header>
        <nav class="main-nav">
            <ul>
                <LinkContext
                    activeState={{
                        class: "active",
                    }}
                >
                    <li>
                        <Link href="/play" activeFor="play"
                            ><span>▷</span><span>▶</span> Play</Link
                        >
                    </li>
                    <li class="divider">|</li>
                    <li>
                        <Link href="/" activeFor="the-alignment-game"
                            ><span>☐</span><span>☑</span> The Alignment Game</Link
                        >
                    </li>
                    <li class="divider">|</li>
                    <li>
                        <Link href="/prompf" activeFor="prompf"
                            ><span>✧</span><span>✦</span> Prompf</Link
                        >
                    </li>
                    <!-- <li class="divider">|</li>
                    <li>
                        <Link href="/legal" activeFor="legal"
                            ><span>🗅</span><span>🗈</span></Link
                        >
                    </li> -->
                    <li class="divider">|</li>
                    <li>
                        <a
                            href="https://github.com/prompf/prompf"
                            aria-label="GitHub"
                        >
                            <span class="svg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    ><path
                                        d="M216.5 362.5c-66-8-112.5-55.5-112.5-117 0-25 9-52 24-70-6.5-16.5-5.5-51.5 2-66 20-2.5 47 8 63 22.5 19-6 39-9 63.5-9s44.5 3 62.5 8.5c15.5-14 43-24.5 63-22 7 13.5 8 48.5 1.5 65.5 16 19 24.5 44.5 24.5 70.5 0 61.5-46.5 108-113.5 116.5 17 11 28.5 35 28.5 62.5l0 52C323 491.5 335.5 500 350.5 494 441 459.5 512 369 512 257 512 115.5 397 0 255.5 0S0 115.5 0 257c0 111 70.5 203 165.5 237.5 13.5 5 26.5-4 26.5-17.5l0-40c-7 3-16 5-24 5-33 0-52.5-18-66.5-51.5-5.5-13.5-11.5-21.5-23-23-6-.5-8-3-8-6 0-6 10-10.5 20-10.5 14.5 0 27 9 40 27.5 10 14.5 20.5 21 33 21s20.5-4.5 32-16c8.5-8.5 15-16 21-21z"
                                    /></svg
                                >
                            </span>
                            <span class="svg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                >
                                    <path
                                        d="M256 0C114.624 0 0 114.624 0 256C0 397.392 114.624 512 256 512C397.376 512 512 397.392 512 256C511.998 114.624 397.375 0 256 0ZM327.71 451.023C326.237 430.991 324.591 406.175 324.494 396.127C323.854 388.415 323.021 368.799 304.398 356.272C378.334 350.08 413.518 309.216 416.047 255.216C418.159 224.465 405.934 197.424 384.223 175.601C385.327 152.257 383.518 124.592 382.016 112.434C365.344 107.634 326.464 128.162 315.599 136.946C292.686 128.049 236.608 124.93 202.528 136.946C178.367 119.954 150.864 109.458 135.872 112.386C122.031 143.058 130.928 172.05 133.631 175.506C115.806 191.794 90.9427 211.842 97.6951 253.842C108.527 315.425 151.855 348.642 221.614 356.769C206.735 359.81 204.222 370.913 202.974 375.729C156.126 395.057 142.735 363.794 136.814 355.649C117.151 331.313 99.5019 338.37 98.4139 338.753C97.3577 339.136 96.558 340.672 96.6705 341.408C97.6617 346.656 108.367 351.985 108.894 352.416C123.406 363.231 128.782 382.768 132.093 388.336C152.909 422.56 201.294 408.368 201.758 408.656C201.789 411.647 201.422 436.833 201.134 456.433C112.912 432.335 47.9996 351.855 47.9996 256C47.9996 141.12 141.12 48.0013 255.998 48.0013C370.877 48.0013 463.999 141.12 463.999 256C463.999 345.647 407.199 421.79 327.71 451.023Z"
                                    />
                                </svg>
                            </span>
                        </a>
                    </li>
                </LinkContext>
            </ul>
        </nav>
    </header>
    <main>
        <Route key="play" path="/play">
            <Play />
        </Route>
        <Route key="the-alignment-game" path="/">
            <TheAlignmentGame />
        </Route>
        <Route key="legal" path="/legal">
            <Legal />
        </Route>
        <Route key="prompf" path="/prompf">
            <Prompf />
        </Route>
        <Fallback>
            <NotFound />
        </Fallback>
    </main>
</Router>
