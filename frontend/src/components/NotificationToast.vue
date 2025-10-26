<template>
  <div v-if="show" class="fixed top-4 right-4 z-50 max-w-sm">
    <div class="bg-dusty-800 border border-dusty-600 rounded-lg shadow-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-2xl">{{ icon }}</span>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-semibold text-frontier-400">{{ title }}</h3>
          <p class="text-sm text-dusty-300 mt-1">{{ message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button @click="close" class="text-dusty-400 hover:text-dusty-300">
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "warning", "info"].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 5000,
  },
});

const show = ref(false);

const icons = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const icon = icons[props.type];

const close = () => {
  show.value = false;
};

onMounted(() => {
  show.value = true;

  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>
