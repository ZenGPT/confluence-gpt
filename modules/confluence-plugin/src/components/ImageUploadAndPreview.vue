<template>
  <div>
    <button class="px-3 py-2 bg-gray-100 rounded-[4px]" @click="handleClick">Upload Sequence Diagram Image</button>
    <input
      ref="fileInput"
      type="file"
      @change="handleImageChange"
      accept="image/*"
      style="display: none"
    />
    <div v-if="showPreview && previewUrl">
      <img :src="previewUrl" alt="Preview" @click="handleRemoveClick" style="width: 200px; height: 200px;" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    onImageSelected: Function,
    onRemove: Function,
    showPreview: Boolean,
  },
  data() {
    return {
      previewUrl: null,
    };
  },
  methods: {
    handleClick() {
      this.$refs.fileInput.click();
    },
    handleImageChange(e) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        this.previewUrl = reader.result;
        this.onImageSelected(file);
      };
      reader.readAsDataURL(file);
    },
    handleRemoveClick() {
      this.previewUrl = null;
      this.onRemove();
      this.$refs.fileInput.value = '';
    },
  },
};
</script>
