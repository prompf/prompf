declare module "*.svx" {
  import type { Component } from "svelte";
  const component: Component<any>;
  export default component;
}

declare module "*.md" {
  import type { Component } from "svelte";
  const component: Component<any>;
  export default component;
}
