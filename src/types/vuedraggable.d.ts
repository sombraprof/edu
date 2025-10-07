declare module 'vuedraggable' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default component;
}
