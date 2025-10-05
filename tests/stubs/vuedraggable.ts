import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DraggableStub',
  setup(_, { slots }) {
    return () => slots.default?.();
  },
});
