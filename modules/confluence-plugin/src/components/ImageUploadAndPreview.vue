<template>
  <div>
    <button class="px-3 py-2 bg-gray-100 rounded-[4px]" @click="handleClick">
      <span>
        <span style="display: inline-block; margin-bottom: -5px;" class="mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="tabler-icon tabler-icon-photo-filled "><path d="M8.813 11.612c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.986 4.986l.094 .083a1 1 0 0 0 1.403 -1.403l-.083 -.094l-1.292 -1.293l.292 -.293l.106 -.095c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.674 4.675a4 4 0 0 1 -3.775 3.599l-.206 .005h-12a4 4 0 0 1 -3.98 -3.603l6.687 -6.69l.106 -.095zm9.187 -9.612a4 4 0 0 1 3.995 3.8l.005 .2v9.585l-3.293 -3.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-.307 .306l-2.293 -2.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-5.307 5.306v-9.585a4 4 0 0 1 3.8 -3.995l.2 -.005h12zm-2.99 5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"></path></svg>
        </span>
        Image
      </span>
    </button>
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
