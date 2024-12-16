


<template>
  <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <div class="logo">
      <img src="/img/olglas.png">
      {{ uiLabels.headLabel }} 
      <img src="/img/olglas.png">
    </div>
  </header>

  
  <body>
    
      <div id="colour">
      <ResponsiveNav v-bind:hideNav="hideNav" id="menubar">
        <button v-on:click="switchLanguage" class="full-width language-button">
          <img :src="uiLabels.flagPicture" alt="Change Language" class="button-icon" />
          <span>{{ uiLabels.changeLanguage }}</span>
        </button>
        <button class="full-width" v-on:click="navigateToCreate">
          {{ uiLabels.createCrawl }}
        </button>
      </ResponsiveNav>

    <section id="start-section">
      <h1>{{ uiLabels["sales-pitch"] }}</h1>
      <h3>{{ uiLabels.subHeading }}</h3>
      <label>
        <input type="text" placeholder="Ex. 1234" v-model="newcrawlId">
      </label>

      <button class="join-button">
      <router-link v-bind:to="'/lobby/' + newcrawlId">
        {{ uiLabels.participateCrawl }}
      </router-link>
      </button>
    </section>
      </div>
    

  </body>


</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      uiLabels: {},
      newcrawlId: "",
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    },
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    },

    navigateToCreate() {
    this.$router.push('/create/');
    } 
  }
}
</script>
<style scoped>
  #colour{background-color: rgb(255, 240, 245);}

  header {
    background-color: rgb(65, 105, 225);
    width: 100%;
    display: grid;
    grid-template-columns: 2em auto;
  }
  .logo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 2.5rem;
    color: white;
    padding-top:0.2em;
  }
  .logo img {
    height:5rem;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }
  .hamburger {
    color:white;
    width:1em;
    display: flex;
    align-items: center;
    justify-content: left;
    padding:0.5rem;
    top:0;
    left:0;
    height: 2rem;
    cursor: pointer;
    font-size: 1.5rem;
  }

@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hamburger::before {
    content: "☰";
  }
  .close::before {
    content: "✕";
  }
  .hide {
    left:-12em;
  }
}

body {
    font-family: 'Galindo';
    background-color: rgb(255, 240, 245); 
    margin: 0; 
    min-height: 100vh; 
}

a {
  text-decoration: none;
  color: black;
}

#menubar {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background-color: rgb(211, 211, 211); 
}

#menubar button {
  flex: 1; /* Gör att varje knapp fyller ut lika mycket */
  padding: 22px; /* Gör knapparna större */
  font-size: 16px; /* Läsbar textstorlek */
  background-color: rgb(65, 105, 225); 
  border: 1px solid black; /* Lätt ram */
  cursor: pointer;

}

input{
    font-size:2rem;
    font-family: 'Galindo';   
}

button {
  font-size: 2rem;
  font-family: 'Galindo';
  background-color: rgb(65, 105, 225)
}

#menubar button:hover{
  color: white;
}

#start-section{
  padding-top: 10rem;
  font-size: 1.5rem;
}

.join-button:hover {
  color: white; /* Gör texten vit vid hover */
}

button.join-button:hover a {
  color: inherit; /* Säkerställer att länken ärver den vita färgen vid hover */
}

.language-button {
  display: flex; /* Använder flexbox för att hantera layouten */
  align-items: center; /* Centrerar bild och text vertikalt */
  gap: 8px; /* Skapar mellanrum mellan bild och text */
}

.button-icon {
  width: 30px; /* Anpassar storlek på flaggan */
  height: auto;
}
</style>
