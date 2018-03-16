<template>
  <div class="toolbar">
    <v-toolbar class="white">
      <v-toolbar-title v-text="title"></v-toolbar-title>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  props: {
  },
  data () {
    return {
    title: 'Dbox'
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
