<template>
  <div :class="keyboardClass"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
// Named, not default: the default export is a wrapper object under Vite,
// and `new` on it throws before the keyboard renders a single key.
import { SimpleKeyboard as Keyboard } from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

const props = defineProps({
  keyboardClass: { type: String, default: "simple-keyboard" },
  input: { type: String, default: "" },
  theme: { type: String, default: "" },
});

const emit = defineEmits(["onChange", "onKeyPress"]);

let keyboard = null;

function onChange(input) {
  emit("onChange", input);
}

function onKeyPress(button) {
  emit("onKeyPress", button);
  if (button === "{shift}" || button === "{capslock}") handleShift();
  if (button === "{numbers}" || button === "{abc}") handleNumbers();
}

function handleShift() {
  const current = keyboard.options.layoutName;
  keyboard.setOptions({ layoutName: current === "default" ? "shift" : "default" });
}

function handleNumbers() {
  const current = keyboard.options.layoutName;
  keyboard.setOptions({ layoutName: current !== "numbers" ? "numbers" : "default" });
}

onMounted(() => {
  keyboard = new Keyboard({
    onChange,
    onKeyPress,
    theme: props.theme,
    layout: {
        default: [
          "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
          "{tab} q w e r t y u i o p [ ] \\",
          "{capslock} a s d f g h j k l ; ' {enter}",
          "{shift} z x c v b n m , . / {shift}",
          ".com @gmail.com @ {space} {numbers}",
        ],
        shift: [
          "~ ! @ # $ % ^ & * ( ) _ + {backspace}",
          "{tab} Q W E R T Y U I O P { } |",
          '{capslock} A S D F G H J K L : " {enter}',
          "{shift} Z X C V B N M < > ? {shift}",
          ".com @ {numbers}",
        ],
        numbers: ["1 2 3", "4 5 6", "7 8 9", "_ 0 .", "{abc} {backspace}"],
      },
      display: {
        "{numbers}": "123",
        "{enter}": "return",
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "⌫",
        "{capslock}": "lock ⇪",
        "{shift}": "shift ⇧",
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC",
        "{space}": "space",
      }
  });
});

// simple-keyboard holds its own DOM, so it has to be torn down explicitly or
// the next time the keyboard opens it attaches to an element that is gone.
onBeforeUnmount(() => {
  keyboard?.destroy();
  keyboard = null;
});

watch(
  () => props.input,
  (value) => keyboard?.setInput(value)
);
</script>

<style>
/* simple-keyboard ships white keys only; this is the dark glass variant the
   kiosk passes in as `dark-theme`. Not scoped: the library owns this DOM. */
.simple-keyboard.dark-theme {
  width: 100%;
  max-width: 1100px;
  background: transparent;
  font-family: inherit;
}

.simple-keyboard.dark-theme .hg-button {
  height: 40px;
  justify-content: center;
  align-items: center;
  background: #ffffff14;
  color: var(--color-ink);
  border: 1px solid #ffffff14;
  border-bottom: 1px solid #ffffff14;
  border-radius: 10px;
  box-shadow: inset 0 1px 0 #ffffff14;
  font-size: 15px;
}

.simple-keyboard.dark-theme .hg-button:active,
.simple-keyboard.dark-theme .hg-button.hg-activeButton {
  background: #ffffff33;
}

/* Modifier keys read as secondary, the way iOS greys them */
.simple-keyboard.dark-theme .hg-functionBtn {
  background: #ffffff0a;
  color: var(--color-ink-dim);
}
</style>
