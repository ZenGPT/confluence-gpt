<template>
  <div class="content h-screen flex flex-col">
    <Header class="flex-shrink-0"/>
    <div class="workspace flex-grow split">
      <div id="workspace-left" class="editor overflow-auto">
        <editor/>
      </div>
      <div id="workspace-right" class="diagram overflow-auto">
        <DiagramPortal />
      </div>
    </div>
    <GPT />
  </div>
</template>

<script>
  import Editor from '@/components/Editor/Editor.vue'
  import Split from 'split.js'
  import Header from "@/components/Header/Header.vue";
  import DiagramPortal from "@/components/DiagramPortal.vue";
  import GPT from '@/components/GPT/index.vue'
  export default {
    name: 'Workspace',
    props: {
      msg: String
    },
    mounted () {
      if (window.split) {
        Split(['#workspace-left', '#workspace-right'])
      }
    },
    components: {
      DiagramPortal,
      Header,
      Editor,
      GPT
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.split {
  display: flex;
  flex-direction: row;
}

.gutter {
  background-color: #eee;
  background-repeat: no-repeat;
  background-position: 50%;
}

.gutter.gutter-horizontal {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
  cursor: col-resize;
}
</style>
