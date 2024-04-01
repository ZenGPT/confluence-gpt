<template>
  <div class="generation-container">
    <div class="generation-form">
      <p class="font-bold text-lg">Generate Diagram</p>
      <textarea id="inputArea" class="styled-textarea" placeholder="Enter an image URL here"></textarea>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <ImageUploadAndPreview
          :onImageSelected="handleImageSelected"
          :onRemove="handleRemoveImage"
          :showPreview="true"
        />
        <button class="px-3 py-2 bg-[#0052CC] rounded-[4px] text-white" @click="handleGenerateClick">Generate</button>
      </div>
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
        </div>
    </div>
  </div>
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
.generation-container {
  position: sticky;
  bottom: 32px;
  width: 768px;
  margin: 0 auto;
  padding-top: 16px;
}

.generation-form {
  background: #fff;
  border-radius: 3px;
  padding: 8px 16px 16px 16px;
  box-shadow: var(
    --ds-shadow-overlay,
    0 4px 8px -2px rgba(9, 30, 66, 0.25),
    0 0 1px rgba(9, 30, 66, 0.31)
  );
}

.styled-textarea {
  margin-top: 8px;
  border: none;
  width: 100%;
}
</style>
