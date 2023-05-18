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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>