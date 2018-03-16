<template>
  <div class="hero">
    <v-parallax src="@/assets/hero.jpeg" height="600">
        <v-layout
        column
        align-center
        justify-center
        class="white--text"
        >
        <img src="@/assets/vuetify.png" alt="Vuetify.js" height="200">
        <h1 class="white--text mb-2 display-1 text-xs-center">Parallax Template</h1>
        <div class="subheading mb-3 text-xs-center">Powered by Vuetify</div>
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
