<template>
  <div class="home">
    <Toolbar />
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue"

export default {
  name: "home",
  components: {
    Toolbar,
    Hero
  }
}
</script>
