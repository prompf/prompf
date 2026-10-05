<svelte:head>
  {#if !document.getElementById("style-scroll")}
    <style id="style-scroll">
      .button-scroll {
        position: fixed;
        bottom: 1rem;
        z-index: 100;
        font-size: smaller;

        button {
          background-color: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          transition: opacity 150ms;
          opacity: 0.3;
          font-family: monospace;
          font-size: inherit;

          &:hover {
            opacity: 0.6;
          }

          .symbol {
            font-size: inherit;
            line-height: 1rem;
            display: block;
          }
        }
      }
    </style>
  {/if}
</svelte:head>
