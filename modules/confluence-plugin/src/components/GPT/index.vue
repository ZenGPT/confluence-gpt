<template>
  <transition name="fade">
    <div v-if="open" class="fixed w-[470px] h-fit bottom-4 right-4 z-50 bg-white text-[#282828] py-10 px-12 rounded-xl drop-shadow-[0_20px_26px_rgba(176,176,176,0.35)]" >
      <div>
        <p class="font-bold text-lg"> Generate Diagram </p>
        <div class="mt-2 flex justify-between text-sm">
          <textarea id="inputArea" class="mr-2" cols="80" rows="3" placeholder="Enter an image URL here"></textarea>
          <ImageUploadAndPreview
            :onImageSelected="handleImageSelected"
            :onRemove="handleRemoveImage"
            :showPreview="true"
          />
          <button class="h-[52px] px-8 py-3 bg-[#282828] rounded-[6px] text-white" @click="handleGenerateClick">Generate</button>
        </div>
      </div>
      <div>
        <transition name="fade-no-transform">
          <div class="bg-inherit rounded-lg flex flex-col py-[18px] -mx-[10px]" v-if="versions.length > 1">
            <div class="flex gap-2">
              <span class="text-center text-lg font-bold">Generated Versions</span>
            </div>
            <p class="mt-4">
              <select id="generatedVersions" v-model="currentVersion" @change="handleOptionChange">
                <option v-for="(option, index) in versions" :key="index" :value="option">{{ option.label }}</option>
              </select>
              <p v-if="currentVersion.input">User input: {{ currentVersion.input }}</p>
            </p>
            <div class="flex justify-end mt-8">
              <button class="h-[52px] px-8 py-3 bg-[#282828] rounded-[6px] text-white" @click="handleCloseClick">Close </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import ImageUploadAndPreview from '@/components/ImageUploadAndPreview.vue'
import EventBus from '@/EventBus';
import store from "@/model/store2";

const versions = ref([]);
const currentVersion = ref({});
const open = ref(false);
const imageFile = ref(null);

let timer: number;

onMounted( () => {
  open.value = true;
  currentVersion.value = {label: 'Original', code: store.state.diagram.mermaidCode};
  //@ts-ignore
  versions.value.push(currentVersion.value);

  EventBus.$on('EditorCodeChange', ({code}) => {
    //@ts-ignore
    currentVersion.value.code = code;
  });
});

onUnmounted(() => {
  clearTimeout(timer)
});

const handleCloseClick = () => {
  setTimeout(() => {
    open.value = false;
  }, 500);
}

const handleImageSelected = (file) => {
  imageFile.value = file;
}

const handleRemoveImage = () => {
  imageFile.value = null;
}

const convert2Base64 = async (file) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
}

const handleGenerateClick = async () => {
  //@ts-ignore
  let input = document.getElementById('inputArea').value;
  if(!input && !imageFile.value) return;

  let content;

  //@ts-ignore
  if(AP?.context) {
    //@ts-ignore
    const token = await AP.context.getToken();

    if (imageFile.value) {
      const formData = new FormData();
      formData.append('image', imageFile.value);
      const response = await fetch(`/upload-image?jwt=${token}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      input = await convert2Base64(imageFile.value); // replace input with base64 if image is uploaded

      console.debug('Uploaded image:', input);
    }

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
    content = matchResult && matchResult[2];
    console.debug('Extracted content:', content);
  } else {
    //local dev
    content = `sequenceDiagram
    title Here is a generation for input ${input}
    participant A
    participant B
    participant C
    participant D
    A->>B: Normal line
    B-->>C: Dashed line
    C->>D: Open arrow
    D-->>A: Dashed open arrow
    `;
  }

  EventBus.$emit('ExternalCodeChange', content);
  //@ts-ignore
  currentVersion.value = {label: new Date().toISOString(), input, code: content};
  //@ts-ignore
  versions.value.push(currentVersion.value);
};

const handleOptionChange = () => {
  //@ts-ignore
  EventBus.$emit('ExternalCodeChange', currentVersion.value.code);
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
