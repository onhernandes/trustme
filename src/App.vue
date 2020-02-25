<template>
  <div class="app">
    <div class="invalid-url">Invalid URL</div>
    <input class="url-input" type="text" v-model="libUrl" />
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      libUrl: ''
    }
  }
}
</script>

<style>
/*
.invalid-url {
  display: none;
}
*/

.url-input {
  width: 100%;
  border-radius: 0;
  box-shadow: unset;
}

.app {
  padding: 1rem;
  flex-basis: 100%;
}

body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  background-color: #faffca;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}

* {
  box-sizing: border-box;
}
</style>
