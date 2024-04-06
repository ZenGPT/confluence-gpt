<template>
  <div class="generation-container">
    <div class="generation-form">
      <p class="font-bold text-lg">Generate Diagram</p>
      <textarea class="styled-textarea" placeholder="Enter an image URL here or upload an image" v-model="inputText"></textarea>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <ImageUploadAndPreview
          :onImageSelected="handleImageSelected"
          :onRemove="handleRemoveImage"
          :showPreview="!isImageFileGenerated()"
        />
        <button class="px-3 py-2 bg-[#0052CC] rounded-[4px] text-white" 
          @click="handleGenerateClick" :disabled="busy">
          <span>
            <span style="display: inline-block; margin-bottom: -5px;" class="mr-1"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path fill="currentColor" fill-rule="evenodd" d="M9.276 4.382L7.357 9.247l-4.863 1.917a.78.78 0 000 1.45l4.863 1.918 1.919 4.863a.78.78 0 001.45 0h-.001l1.918-4.863 4.864-1.919a.781.781 0 000-1.45l-4.864-1.916-1.918-4.865a.776.776 0 00-.44-.438.778.778 0 00-1.01.438zm8.297-2.03l-.743 1.886-1.884.743a.56.56 0 000 1.038l1.884.743.743 1.886a.558.558 0 001.038 0l.745-1.886 1.883-.743a.557.557 0 000-1.038l-1.883-.743-.745-1.885a.552.552 0 00-.314-.314.562.562 0 00-.724.314zm-.704 13.003l-.744 1.883-1.883.744a.553.553 0 00-.316.314.56.56 0 00.316.724l1.883.743.744 1.884c.057.144.17.258.314.315a.56.56 0 00.724-.315l.744-1.884 1.883-.743a.557.557 0 000-1.038l-1.883-.744-.744-1.883a.551.551 0 00-.315-.316.56.56 0 00-.723.316z"></path></svg></span>
            <span v-if="!busy">Generate</span>
            <span v-if="busy">Generating...</span>
          </span>
        </button>
      </div>
      <div class="bg-inherit rounded-lg flex flex-col py-[18px] -mx-[10px]" v-if="versions.length > 1">
          <div class="flex gap-2">
            <span class="text-center text-lg font-bold">Generated Versions</span>
          </div>
          <p class="mt-4">
            <select id="generatedVersions" v-model="currentVersion" @change="handleOptionChange">
              <option v-for="(option, index) in versions" :key="index" :value="option">{{ option.label }}</option>
            </select>
            <p v-if="currentVersion.isInputUrl"><img :src=currentVersion.input class="image-preview" /></p>
            <p v-if="!currentVersion.isInputUrl && currentVersion.input">User Input: {{ currentVersion.input }}</p>
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
const inputText = ref('');
const busy = ref(false);

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
  inputText.value = '';
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
  let input = inputText.value;
  if(!input && !imageFile.value) return;

  busy.value = true;
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
        console.error('Failed to upload image');
        //TODO: track event
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
  const isUrl = (str) => str.toLowerCase().startsWith('http') || str.toLowerCase().startsWith('data:image');

  //@ts-ignore
  currentVersion.value = {label: new Date().toISOString(), input, isInputUrl: isUrl(input), imageFile: imageFile.value, code: content};
  //@ts-ignore
  versions.value.push(currentVersion.value);

  busy.value = false;
};

function isImageFileGenerated() {
  //@ts-ignore
  return versions.value.find(v => v.imageFile == imageFile.value);
}

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

.image-preview {
  max-width: 200px;
}
</style>
