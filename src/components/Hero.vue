<template>
  <div class="hero">
    <v-parallax v-bind:src="require('@/assets/background.png')" height="600">
        <v-layout
        column
        align-center
        justify-center
        class="white--text"
        >
        <img src="@/assets/vuetify.png" alt="Vuetify.js" height="200">
        <h1 class="white--text mb-2 display-1 text-xs-center">Dbox</h1>
        <div class="subheading mb-3 text-xs-center">Dbox is an open source library that makes predefined and dynamic charts with the power of @d3js_org.</div>
        <v-btn
            class="blue lighten-2 mt-5"
            dark
            large
            href="/pre-made-themes"
        >
            Get Started
        </v-btn>
        </v-layout>
    </v-parallax>
  </div>
</template>

<script>
export default {
  name: "Hero",
  props: {
  },
  data () {
    return {
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
