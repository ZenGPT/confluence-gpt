<template>
  <div>
    <div id="generation-container" class="generation-container" v-if="open">
      <div id="generation-form" class="generation-form">
        <div style="display: flex; justify-content: space-between;">
          <p class="font-bold text-lg">Generate Diagram</p>
          <button type="button" class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            @click="handleCloseClick">
            <span class="sr-only">Close menu</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      
        <textarea class="styled-textarea" placeholder="Enter an image URL here or upload an image" 
          v-model="inputText" @change="handlInputTextChange"></textarea>
        <img id="userInputImage" :src="inputText" style="max-width: 200px;" v-show="inputText && !inputValidationError && !isUserInputGenerated()"/>
        <div v-if="inputValidationError">{{ inputValidationError }}</div>

        <div style="display: flex; align-items: center; justify-content: space-between;">
          <ImageUploadAndPreview
            :onImageSelected="handleImageSelected"
            :onRemove="handleRemoveImage"
            :showPreview="imageFile && !isImageFileGenerated()"
          />
          <button class="px-3 py-2 bg-[#0052CC] rounded-[4px] text-white" 
            @click="handleGenerateClick" :disabled="busy">
            <span>
              <span style="display: inline-block; margin-bottom: -5px;" class="mr-1">
                <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" v-if="!busy"><path fill="currentColor" fill-rule="evenodd" d="M9.276 4.382L7.357 9.247l-4.863 1.917a.78.78 0 000 1.45l4.863 1.918 1.919 4.863a.78.78 0 001.45 0h-.001l1.918-4.863 4.864-1.919a.781.781 0 000-1.45l-4.864-1.916-1.918-4.865a.776.776 0 00-.44-.438.778.778 0 00-1.01.438zm8.297-2.03l-.743 1.886-1.884.743a.56.56 0 000 1.038l1.884.743.743 1.886a.558.558 0 001.038 0l.745-1.886 1.883-.743a.557.557 0 000-1.038l-1.883-.743-.745-1.885a.552.552 0 00-.314-.314.562.562 0 00-.724.314zm-.704 13.003l-.744 1.883-1.883.744a.553.553 0 00-.316.314.56.56 0 00.316.724l1.883.743.744 1.884c.057.144.17.258.314.315a.56.56 0 00.724-.315l.744-1.884 1.883-.743a.557.557 0 000-1.038l-1.883-.744-.744-1.883a.551.551 0 00-.315-.316.56.56 0 00-.723.316z"></path></svg>
                <svg width="20" height="20" aria-hidden="true" class="text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mr-1" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="busy">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/> </svg>
              </span>
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
              <p><img :src=currentVersion.input class="image-preview" /></p>
            </p>
        </div>
      </div>
    </div>

    <div class="fixed h-fit bottom-4 right-4 z-50 bg-white text-[#282828] py-5 px-4 rounded-xl drop-shadow-[0_20px_26px_rgba(176,176,176,0.35)]" v-if="!open">
      <button @click="handleOpenClick">
        <svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path fill="currentColor" fill-rule="evenodd" d="M9.276 4.382L7.357 9.247l-4.863 1.917a.78.78 0 000 1.45l4.863 1.918 1.919 4.863a.78.78 0 001.45 0h-.001l1.918-4.863 4.864-1.919a.781.781 0 000-1.45l-4.864-1.916-1.918-4.865a.776.776 0 00-.44-.438.778.778 0 00-1.01.438zm8.297-2.03l-.743 1.886-1.884.743a.56.56 0 000 1.038l1.884.743.743 1.886a.558.558 0 001.038 0l.745-1.886 1.883-.743a.557.557 0 000-1.038l-1.883-.743-.745-1.885a.552.552 0 00-.314-.314.562.562 0 00-.724.314zm-.704 13.003l-.744 1.883-1.883.744a.553.553 0 00-.316.314.56.56 0 00.316.724l1.883.743.744 1.884c.057.144.17.258.314.315a.56.56 0 00.724-.315l.744-1.884 1.883-.743a.557.557 0 000-1.038l-1.883-.744-.744-1.883a.551.551 0 00-.315-.316.56.56 0 00-.723.316z"></path></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import ImageUploadAndPreview from '@/components/ImageUploadAndPreview.vue'
import EventBus from '@/EventBus';
import store from "@/model/store2";
import { convert2Base64, scrollToElement, isUrl } from "@/utils/web-utils";
import { retryableImageToDsl2 } from "@/services/gpt-service";
import { uploadImage } from "@/services/upload-service";

const versions = ref([]);
const currentVersion = ref({});
const open = ref(true);
const imageFile = ref(null);
const inputText = ref('');
const busy = ref(false);
const inputValidationError = ref('');

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

function handleCloseClick() {
  open.value = false;
}

function handleOpenClick() {
  open.value = true;

  setTimeout(() => {
    scrollToElement('generation-form');
  }, 500);
}

const handleImageSelected = (file) => {
  imageFile.value = file;
  inputText.value = '';
  inputValidationError.value = '';
}

const handleRemoveImage = () => {
  imageFile.value = null;
}

const handleGenerateClick = async () => {
  //@ts-ignore
  let input = inputText.value;
  if(!(input) && !imageFile.value) return;

  if(input && !isUrl(input)) {
    inputValidationError.value = 'Invalid URL';
    return;
  }

  busy.value = true;

  if (imageFile.value) {
    await uploadImage(imageFile.value);
    input = await convert2Base64(imageFile.value);
  }

  const content = await retryableImageToDsl2(input);

  EventBus.$emit('ExternalCodeChange', content);

  //@ts-ignore
  currentVersion.value = {label: new Date().toISOString(), input, imageFile: imageFile.value, code: content};
  //@ts-ignore
  versions.value.push(currentVersion.value);

  busy.value = false;
};

function isImageFileGenerated() {
  //@ts-ignore
  return versions.value.find(v => v.imageFile == imageFile.value);
}

function isUserInputGenerated() {
  //@ts-ignore
  return versions.value.find(v => v.input == inputText.value);
}

const handleOptionChange = () => {
  //@ts-ignore
  EventBus.$emit('ExternalCodeChange', currentVersion.value.code);
};

function handlInputTextChange() {
  if(inputText.value) {
    inputValidationError.value = '';
    imageFile.value = null;
  }
}
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
  border: none;
  width: 100%;
}

.image-preview {
  max-width: 200px;
}
</style>
