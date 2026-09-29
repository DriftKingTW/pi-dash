<template>
  <svg
    class="claude-robot"
    :class="{ 'is-asleep': asleep }"
    :width="size"
    :height="Math.round((size * 10) / 16)"
    viewBox="0 0 16 10"
    shape-rendering="crispEdges"
    aria-hidden="true"
  >
    <defs>
      <!-- The eyes are holes in the body, so the mark sits on any background -->
      <mask :id="maskId">
        <rect x="0" y="0" width="16" height="10" fill="white" />
        <rect class="eye eye--left" x="4" y="2" width="1" height="2" fill="black" />
        <rect class="eye eye--right" x="11" y="2" width="1" height="2" fill="black" />
      </mask>
    </defs>

    <g :mask="`url(#${maskId})`" :fill="color">
      <!-- Body, then the arms reaching out either side -->
      <rect x="2" y="0" width="12" height="8" />
      <rect x="0" y="4" width="16" height="2" />

      <!-- Two leg poses, alternated to read as a shuffle -->
      <g class="legs legs-a">
        <rect x="3" y="8" width="1" height="2" />
        <rect x="12" y="8" width="1" height="2" />
        <rect x="5" y="8" width="1" height="1" />
        <rect x="10" y="8" width="1" height="1" />
      </g>
      <g class="legs legs-b">
        <rect x="5" y="8" width="1" height="2" />
        <rect x="10" y="8" width="1" height="2" />
        <rect x="3" y="8" width="1" height="1" />
        <rect x="12" y="8" width="1" height="1" />
      </g>
    </g>
  </svg>
</template>

<script>
// Unique per instance so two robots on one page cannot share a mask.
let nextId = 0;

export default {
  name: "ClaudeRobot",

  props: {
    size: {
      type: Number,
      default: 40,
    },
    color: {
      type: String,
      default: "#c4825e",
    },
    // Shuts its eyes and slows down when nothing has been running for a while.
    asleep: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      maskId: `claude-robot-eyes-${nextId++}`,
    };
  },
};
</script>

<style scoped>
/* Only transform and opacity, so the compositor does the work rather than the
   Pi's CPU repainting a kiosk that never closes. */
.claude-robot {
  display: block;
  animation: robot-bob 3.4s ease-in-out infinite;
}

.eye {
  animation: robot-blink 4.3s steps(1, end) infinite;
}

.legs-a {
  animation: robot-legs-a 1.24s steps(1, end) infinite;
}

.legs-b {
  animation: robot-legs-b 1.24s steps(1, end) infinite;
}

/* Asleep: eyes stay shut, no shuffling, and a slower, shallower breath */
.claude-robot.is-asleep {
  animation-duration: 6s;
}

/* Asleep the eyes become closed lids rather than disappearing: a face with no
   eyes at all reads as a rendering fault, and simply shrinking the notch just
   makes a smaller eye. It has to get wider as it gets shorter to read as shut.
   Each lid stays centred on the eye it replaces. SVG geometry is stylable in
   Chromium, which is what the kiosk runs. */
.is-asleep .eye {
  animation: none;
  opacity: 1;
  y: 3px;
  height: 1px;
  width: 3px;
}

.is-asleep .eye--left {
  x: 3px;
}

.is-asleep .eye--right {
  x: 10px;
}

.is-asleep .legs-a {
  animation: none;
  opacity: 1;
}

.is-asleep .legs-b {
  animation: none;
  opacity: 0;
}

@keyframes robot-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6%);
  }
}

/* Two blinks in quick succession near the end of the cycle: a single blink on
   a long period reads as a glitch rather than as blinking. */
@keyframes robot-blink {
  0%,
  89%,
  92%,
  95%,
  98%,
  100% {
    opacity: 1;
  }
  90%,
  96% {
    opacity: 0;
  }
}

@keyframes robot-legs-a {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes robot-legs-b {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
