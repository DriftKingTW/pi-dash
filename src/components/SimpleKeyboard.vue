<template>
  <div :class="keyboardClass"></div>
</template>

<script>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

export default {
  name: "SimpleKeyboard",

  props: {
    keyboardClass: {
      default: "simple-keyboard",
      type: String,
    },
    input: {
      type: String,
    },
    theme: String,
  },

  data: () => ({
    keyboard: null,
  }),

  mounted() {
    this.keyboard = new Keyboard({
      onChange: this.onChange,
      onKeyPress: this.onKeyPress,
      theme: this.theme,
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
      },
    });
  },

  methods: {
    onChange(input) {
      this.$emit("onChange", input);
    },

    onKeyPress(button) {
      this.$emit("onKeyPress", button);

      /**
       * If you want to handle the shift and caps lock buttons
       */
      if (button === "{shift}" || button === "{capslock}") this.handleShift();
      if (button === "{numbers}" || button === "{abc}") this.handleNumbers();
    },

    handleShift() {
      let currentLayout = this.keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";

      this.keyboard.setOptions({
        layoutName: shiftToggle,
      });
    },

    handleNumbers() {
      let currentLayout = this.keyboard.options.layoutName;
      let numbersToggle = currentLayout !== "numbers" ? "numbers" : "default";

      this.keyboard.setOptions({
        layoutName: numbersToggle,
      });
    },
  },

  watch: {
    input(input) {
      this.keyboard.setInput(input);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
