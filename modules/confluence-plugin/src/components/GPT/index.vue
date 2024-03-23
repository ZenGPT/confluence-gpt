<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed w-[470px] h-fit bottom-4 right-4 z-50 bg-white text-[#282828] py-10 px-12 rounded-xl drop-shadow-[0_20px_26px_rgba(176,176,176,0.35)]"
    >
      <div v-if="!hasFeedback">
        <p class="font-bold text-lg">
          Generate Diagram
        </p>
        <div class="mt-8 flex justify-between text-sm">
          <textarea id="inputArea" cols="50" rows="5" placeholder="Enter an image URL here"></textarea>
          <button @click="handleGenerateClick">Generate</button>
        </div>
      </div>
      <div>
        <transition name="fade-no-transform">
          <div
            class="bg-inherit rounded-lg flex flex-col py-[18px] -mx-[10px]"
            v-if="hasFeedback && csatVal"
          >
            <div class="flex gap-2">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="18" fill="#1BA97F"/>
                <path d="M12.7119 18L16.4619 21.75L23.9619 14.25" stroke="white" stroke-width="1.125"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="text-center text-4xl font-bold">Thank You</span>
            </div>
            <p class="mt-4">Your review was successfully submitted.</p>
            <div class="flex justify-end mt-8">
              <button class="h-[52px] px-8 py-3 bg-[#282828] rounded-[6px] text-white" @click="handleCloseClick">Close
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import useCSATState from "@/hooks/useCSATState";
import {trackEvent} from "@/utils/window";
import EventBus from '@/EventBus'

const score = ['\u{1F620}', '\u{1F612}', '\u{1F610}', '\u{1F60A}', '\u{1F60D}'];
const hasFeedback = ref(false);
const open = ref(false);
const csatVal = ref<null | number>(null);

const {checkStateOfCSAT, updateStateOfCSAT} = useCSATState();

let timer: number;

onMounted( () => {
  open.value = true;
});

onUnmounted(() => {
  clearTimeout(timer)
});

const handleSkipClick = () => {
  hasFeedback.value = true;
}

const handlePopTooFrequentlyClick = () => {
  trackEvent("csat", "csat_too_frequent", "operation");
  open.value = false;
  hasFeedback.value = false;
  updateStateOfCSAT();
}

const handleTellUsMoreClick = () => {
  trackEvent("csat", "csat_tell_us_more", "operation");
  hasFeedback.value = true;
}

const handleCloseClick = () => {
  trackEvent("csat", "click", "operation", {
    csat_value: csatVal.value,
  });

  setTimeout(() => {
    open.value = false;
    hasFeedback.value = false;
    updateStateOfCSAT();
  }, 500);
}

const handleGenerateClick = async () => {
  //@ts-ignore
  const input = document.getElementById('inputArea').value;
  if(!input) return;

  //@ts-ignore
  const token = await AP.context.getToken();
  const response = await fetch(`/image-to-dsl?jwt=${token}`, {
    method: 'POST',
    body: JSON.stringify({imageUrl: input}),
    headers: { 'Content-type': 'application/json; charset=UTF-8', },
  });

  // TODO: abstract to a lib function
  const answer = await response.json();

  const matchResult = answer.match(/```(json|mermaid)?([\s\S]*?)```/);
  if(!matchResult) {
    console.error(`Unparsable GPT answer:`, answer);
  }
  const content = matchResult && matchResult[2];
  console.debug('Extracted content:', content);

  EventBus.$emit('updateCode', content)
};

const handleSetValue = (value: number) => {
  csatVal.value = value;
};

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all .3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.fade-leave-active {
  transform: translateY(30px);
}

.fade-no-transform-enter-active, .fade-no-transform-leave-active {
  transition: opacity .3s ease;
}

.fade-no-transform-enter, .fade-no-transform-leave-to {
  opacity: 0;
}
</style>
