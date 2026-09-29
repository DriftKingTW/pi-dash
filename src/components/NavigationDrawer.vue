<template>
  <!-- Placeholder menu: the entries were Foo/Bar/Fizz/Buzz before the port and
       are carried over unchanged, since nothing has been decided for them. -->
  <Teleport to="body">
    <div
      v-if="ui.navDrawer"
      class="fixed inset-0 z-40 bg-black/50"
      @click="ui.navDrawer = false"
    />
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-x-full"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="-translate-x-full"
    >
      <nav
        v-if="ui.navDrawer"
        class="fixed inset-y-0 left-0 z-40 w-56 border-r border-line bg-surface p-2"
      >
        <button
          v-for="item in items"
          :key="item"
          class="block w-full rounded-lg px-4 py-3 text-left text-ink hover:bg-surface-2"
        >
          {{ item }}
        </button>
      </nav>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const items = ["Foo", "Bar", "Fizz", "Buzz"];
</script>
