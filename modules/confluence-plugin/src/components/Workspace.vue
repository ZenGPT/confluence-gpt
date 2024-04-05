<template>
  <div class="content h-screen flex flex-col">

    <Header class="flex-shrink-0"/>
    <div class="left">

    </div>
    <div class="right">
      <button class="flex items-center bg-blue-700 px-2 py-1 text-white text-sm font-semibold rounded disabled:bg-gray-300" @click.stop="modeSwitch">{{modeSwitchBtnTxt}}</button>
      <div class="workspace flex-grow split" v-if="swithToEditMode">
          <div id="workspace-left" class="editor overflow-auto">
            <editor/>
          </div>
          <div id="workspace-right" class="diagram overflow-auto">
            <DiagramPortal />
          </div>
      </div>

      <div class="workspace flex-grow" v-if="swithToEditMode == false">
          <div id="workspace-right" class="diagram overflow-auto">
            <DiagramPortal />
          </div>
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
      msg: String,
      modeSwitchBtnTxt: {
        type: String,
        default: "Edit"
      },
      swithToEditMode: {
        type: Boolean,
        default: false
      }
    },
    mounted () {
      if (window.split) {
        Split(['#workspace-left', '#workspace-right'])
      }
    },
    setup(props){
      const modeSwitch = () => {
        props.swithToEditMode = !props.swithToEditMode;
        props.modeSwitchBtnTxt = props.swithToEditMode?"Edit":"View";
      }
      return {
        modeSwitch
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
