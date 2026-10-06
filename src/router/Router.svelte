<script lang="ts">
    import { Fallback, Route, Router } from "@svelte-router/core";
    import NavBar from "./NavBar.svelte";
    import NotFound from "../notFound/NotFound.svelte";
    import ThePainGame from "../thePainGame/ThePainGame.svx";
    import Align from "../align/Align.svx";
    import Prompf from "../../PROMPF.svx";
</script>

<Router id="root-router">
    <NavBar />
    <Route key="align" path="/">
        <Align />
    </Route>
    <Route key="the-pain-game" path="/the-pain-game">
        <ThePainGame />
    </Route>
    <Route key="prompf" path="/prompf">
        <Prompf />
    </Route>
    <Fallback>
        <NotFound />
    </Fallback>
</Router>
