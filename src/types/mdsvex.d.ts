declare module "*.svx" {
  import type { Component } from "svelte";
  const component: Component<any>;
  export default component;
  export const metadata: Record<string, any>;
}

declare module "*.md" {
  import type { Component } from "svelte";
  const component: Component<any>;
  export default component;
  export const metadata: Record<string, any>;
}
