<template>
  <div class="home">
    <Toolbar />
    <v-content>
      <section>
        <Hero />
      </section>
      <section>
        <Features />
      </section>
    </v-content>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue"
import Hero from "@/components/Hero.vue"
import Features from "@/components/Features.vue"

export default {
  name: "home",
  components: {
    Toolbar,
    Hero,
    Features
  }
}
</script>
