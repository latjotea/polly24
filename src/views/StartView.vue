


<template>
  <header>
    
    <div class="logo">
      <img src="/img/olglasspegel.png" class="wobble">
      {{ uiLabels.headLabel }} 
      <img src="/img/olglas.png" class="wobble">
    </div>
  </header>

  
  <body>
    
      <div id="colour">
      <nav id="menubar">
        <button v-on:click="switchLanguage" class="language-button">
          <img :src="uiLabels.flagPicture" alt="Change Language" class="button-icon" />
          <span>{{ uiLabels.changeLanguage }}</span>
        </button>
        <button v-on:click="navigateToCreate">
          {{ uiLabels.createCrawl }}
        </button>
      </Nav>

    <section id="start-section">
      <h1>{{ uiLabels["sales-pitch"] }}</h1>
      <h3>{{ uiLabels.subHeading }}</h3>
      <label>
        <input type="text" placeholder="Ex. 1234" v-model="newcrawlId">
      </label>

      <button class="join-button" v-on:click="handleJoinButton">
        {{ uiLabels.participateInCrawl }}
      </button>
      <div v-if="invalidCrawlId" id="invalidCrawlId">
        {{ uiLabels.invalid }}
      </div>
    </section>
      </div>
    

  </body>


</template>

<script>
import io from 'socket.io-client';
sessionStorage.setItem("dataServer","172.20.10.3:3000") //Ändra varje gång beroende på vilket nätverk vi ansluter till
const socket = io(sessionStorage.getItem("dataServer"));

export default {
  name: 'StartView',
  
  data: function () {
    return {
      uiLabels: {},
      newcrawlId: "",
      lang: localStorage.getItem( "lang") || "en",
      invalidCrawlId: false,
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
    

    navigateToCreate() {
    this.$router.push('/create/');
    },

    handleJoinButton() {
      socket.emit("checkActiveCrawl", { crawlId: this.newcrawlId });
      socket.once("activeCrawlResponse", (isActive) => {
        if (!isActive) {
        this.invalidCrawlId = true;
        }
        else {
          this.$router.push(`/lobby/${this.newcrawlId}`);
        }
    });
  }
}
}

</script>

<style scoped>
  #colour{background-color: rgb(255, 240, 245);}

  header {
    background-color: rgb(65, 105, 225);
    width: 100%;
    padding: 1rem;
   }

  .logo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 2.5rem;
    color: white;
    text-align:center;  }

  .logo img {
    height:5rem;
    vertical-align: bottom;
    margin-right: 0.5rem; 
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
  gap: 1rem;
  padding: 1rem;
  background-color: rgb(255, 240, 245); 
}



#menubar button {
  flex: 1; 
  padding: 22px; 
  font-size: 16px;
  background-color: rgb(65, 105, 225); 
  border: 1px rgb(65, 105, 225); 
  cursor: pointer;
  border-radius: 15px;
  margin: 0; /* Remove any margin */
  white-space: nowrap; /* Prevents text wrapping */
}


.language-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-icon {
  width: 30px;
  height: auto;
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
  padding-top: 5rem;
  font-size: 1.5rem;
  text-align: center;

}



.join-button:hover {
  color: white; 
}

button.join-button:hover a {
  color: inherit;
}



.button-icon {
  width: 30px; /* Anpassar storlek på flaggan */
  height: auto;
}

#invalidCrawlId {
    color: red;
    margin-top: 1rem;
  }


@media screen and (max-width: 50em) {
  .logo {
    font-size: 5vw;
  }
  
  /* ADDED: Ensure horizontal layout */
  #menubar {
    flex-direction: row;
  }
  
}

.wobble {
  display: inline-block; 
  animation: wobble 1s infinite; 
}

/* W#SCHOOL och Geeks for geeks  */
@keyframes wobble {
  0%, 100% {
    transform: rotate(0deg); 
  }
  25% {
    transform: rotate(10deg); 
  }
  50% {
    transform: rotate(0deg); 
  }
  75% {
    transform: rotate(-10deg); 
  }
}

</style>
