<template>
  <div id="app">
    <googleMap />
  </div>
</template>

<script>
import googleMap from './components/googleMap.vue';

export default {
  name: 'App',
  components: {
    googleMap
  }
}

</script>

<style>
/* center the map */
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>