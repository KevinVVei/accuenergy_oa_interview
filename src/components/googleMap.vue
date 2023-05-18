<template>
  <div class="app-container">
    <GMapMap
        :center="center"
        :zoom="7"
        map-type-id="terrain"
        class="map"
    >
      <GMapMarker
          :key="marker.id"
          v-for="marker in markers"
          :position="marker.position"
      />
    </GMapMap>
    <div class="action-area-container">
      <div class="search-area">
        <GMapAutocomplete
          @place_changed="placeChanged"
          @keyup.enter="search"
          :placeholder="'Enter location'"
          :types="['geocode']"
          class="search-bar"
        />
        <button @click="search" class="button">Search</button>
        <button @click="removeAll" class="button">Delete All</button>
      </div>
      <button @click="getCurrentLocation" class="button">Get Current Location</button>
      <button @click="removeSelected" class="button">Delete Selected</button>    
      <table class="table">
        <thead>
          <tr>
            <th id="select-one">Select</th>
            <th>Place</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="marker in paginatedMarkers" :key="marker.id">
            <td id="address-checkbox-container" @click.stop="marker.selected = !marker.selected">
              <input type="checkbox" v-model="marker.selected">
            </td>
            <td>{{ marker.place }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage == 0" class="button">Previous</button>
        <p>Page {{ currentPage + 1 }} of {{ Math.ceil(markers.length / pageSize) }}</p>
        <button @click="nextPage" :disabled="currentPage >= (markers.length - 1) / pageSize" class="button">Next</button>
      </div>
      <div class="time-info">
        <p>Time Zone: {{ latestSearch.timeZoneId }}</p>
        <p>Local Time: {{ latestSearch.localTime }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'App',
  data() {
    return {
      center: {lat: 0, lng: 0},
      markers: [],
      searchLocation: '',
      currentPage: 0,
      pageSize: 10,
      latestSearch: {
      timeZoneId: '',
      localTime: '',
    },
    };
  },
  computed: {
    paginatedMarkers() {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      return this.markers.slice(start, end);
    },
  },
  mounted() {
    this.getCurrentLocation();
    this.loadMarkerFromLocalStorage();
  },
  methods: {
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          this.center = { lat: position.coords.latitude, lng: position.coords.longitude };
          const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.center.lat},${this.center.lng}&key=AIzaSyCbDwWwkpQrD04Z_0OtZka_Y3A7qPOxpf4`);
          
          let city = null;
          let state = null;
          let country = null;

          for (let component of response.data.results[0].address_components) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            } else if (component.types.includes("administrative_area_level_1")) {
              state = component.long_name;
            } else if (component.types.includes("country")) {
              country = component.long_name;
            }
          }

          let placeName = `${city ? city + ", " : ""}${state ? state + ", " : ""}${country || ""}`;
          // check if there is duplicate
          if (!this.markers.some(marker => marker.place === placeName)) {
            this.addMarker(this.center, placeName);
            this.fetchTimeZone(this.center.lat, this.center.lng);
          }
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
        this.addMarker(this.center, this.place.formatted_address);
        this.fetchTimeZone(this.center.lat, this.center.lng);
      }
    },
    placeChanged(place) {
      this.place = place;
    },
    addMarker(position, place) {
      const marker = {
        id: Date.now().toString(),
        position,
        place,
        selected: false,
      };
      if (!this.markers.some(existingMarker => existingMarker.place === marker.place)) {
        this.markers.push(marker);
        this.saveMarkersToLocalStorage();
      }
    },
    removeSelected() {
      this.markers = this.markers.filter(marker => !marker.selected);
      // clear the selected item from localStorage
      localStorage.setItem('markers', JSON.stringify(this.markers));
    },
    removeAll() {
      this.markers = [];
      localStorage.clear();
    },
    previousPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < Math.ceil(this.markers.length / this.pageSize) - 1) {
        this.currentPage++;
      }
    },
    async fetchTimeZone(lat, lng) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=AIzaSyCbDwWwkpQrD04Z_0OtZka_Y3A7qPOxpf4`);
    const data = response.data;
    this.latestSearch.timeZoneId = data.timeZoneId;
    const date = new Date();
      this.latestSearch.localTime = date.toLocaleString();
      console.log(data);
    },
    saveMarkersToLocalStorage() {
      localStorage.setItem('markers', JSON.stringify(this.markers));
    },
    loadMarkerFromLocalStorage() {
      const markers = localStorage.getItem('markers');
      if (markers) {
        this.markers = JSON.parse(markers);
      }
    },
  },
};
</script>

<style>
  .app-container {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    width: 100vw;
    height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
  }

  .map {
    flex: 1;
    margin-right: 2rem;
  }

  .action-area-container {
    display: flex;
    flex-direction: column;
    width: 25%;
    max-height: 100%;
    overflow: auto;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .search-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .search-area button{ 
    margin-bottom: 0;
  }
  .search-bar {
    flex: 1;
    margin-right: 1rem;
  }
  .button {
    background: #007BFF;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.3s;
  }

  .button:hover {
    background: #0056b3;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .table th, .table td {
    border: 1px solid #ccc;
    padding: 0.5rem;
  }

  .table th {
    background: #f8f9fa;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
  }

  .time-info {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #6c757d;
  }
  #address-checkbox-container {
    text-align: center;
  }
</style>