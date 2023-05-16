<template>
  <div>
    <GMapMap
        :center="center"
        :zoom="7"
        map-type-id="terrain"
        style="width: 1000px; height: 800px"
    >
      <GMapMarker
          :key="marker.id"
          v-for="marker in markers"
          :position="marker.position"
      />
    </GMapMap>
    <button @click="getCurrentLocation">Get Current Location</button>
    <div class="search-area">
      <GMapAutocomplete
        @place_changed="placeChanged"
        @keyup.enter="search"
        :placeholder="'Enter location'"
        :types="['geocode']"
      />
      <button @click="search">Search</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      center: {lat: 0, lng: 0}, // Initialize to (0, 0) or any default location
      markers: [],
      searchLocation: '',
    };
  },
  mounted() {
    this.getCurrentLocation();
  },
  methods: {
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.center = { lat: position.coords.latitude, lng: position.coords.longitude };
          this.markers.push({
            id: Date.now().toString(),
            position: this.center,
          });
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    },
    search() {
      if (this.place) {
        this.center = {
          lat: this.place.geometry.location.lat(),
          lng: this.place.geometry.location.lng(),
        };
        this.markers.push({
          id: Date.now().toString(),
          position: this.center,
        });
      }
    },
    placeChanged(place) {
      this.place = place;
    },
  },
};
</script>
<style scoped>
.search-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
