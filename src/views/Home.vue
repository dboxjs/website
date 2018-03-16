<template>
  <div class="home">
    <Toolbar />
    <v-content>
      <section>
        <Hero />
      </section>
    </v-content>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue"
import Hero from "@/components/Hero.vue"

export default {
  name: "home",
  components: {
    Toolbar,
    Hero
  }
}
</script>
