<script setup>
import { RouterView } from 'vue-router'


// !!!!!! gör en ny request till servern, OBS vi vill kanske inte detta !!!!!//
window.onpopstate = function () {
    location.reload()
};

</script>

<template>
  <RouterView />
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Butcherman&family=Galindo&family=Geist+Mono:wght@100..900&family=Slackey&display=swap');

header{
  font-family: 'Galindo';
}


</style>
