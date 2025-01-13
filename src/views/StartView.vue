


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
        <button v-on:click="switchLanguage" class="blue-button">
          <img :src="uiLabels.flagPicture" alt="Change Language" class="button-icon" />
          <span>{{ uiLabels.changeLanguage }}</span>
        </button>
        <button v-on:click="navigateToCreate" class="blue-button">
          {{ uiLabels.createCrawl }}
        </button>
      </Nav>

    <section id="start-section">
      <h1>{{ uiLabels["sales-pitch"] }}</h1>
      <h3>{{ uiLabels.subHeading }}</h3>
      <label>
        <input type="text" placeholder="Ex. 1234" v-model="newcrawlId">
      </label>
      <div>
        <button class="green-button" v-on:click="handleJoinButton">
        {{ uiLabels.participateInCrawl }}
      </button>
      </div>
   
      <div v-if="invalidCrawlId" class="invalid">
        {{ uiLabels.invalid }}
      </div>
    </section>
      </div>
    

  </body>


</template>

<script>
import io from 'socket.io-client';
sessionStorage.setItem("dataServer","172.20.10.2:3000") //Ändra varje gång beroende på vilket nätverk vi ansluter till
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


  #menubar {
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    gap: 1rem;
    padding: 1rem;
}

#menubar button {
  flex: 1; 
  padding: 0.8rem; 
  font-size: 16px; 
  margin: 0;
  height:3rem;
}

.button-icon {
  width: 30px;
  height: auto;
  margin-right: 10px;
}



#start-section{
  padding-top: 5rem;
  font-size: 1.5rem;
  text-align: center;

}



.button-icon {
  width: 30px; /* Anpassar storlek på flaggan */
  height: auto;
}



.wobble {
  display: inline-block; 
  animation: wobble 1s infinite; 

}



  @media screen and (max-width: 600px) {

  header {
    padding: 0.5rem;
  }

  input{
    font-size: 1.9rem;
  }

  .logo {
    font-size: 1.2rem; /* Mindre text */
    letter-spacing: 0.1em; /* Mindre mellanrum */
    gap: 0.25rem; /* Mindre mellanrum mellan elementen */
  }

  .logo img {
    height: 2.5rem; /* Mindre bilder */
  }

  #menubar {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  #menubar button {
    width: 100%;
    padding: 0.8rem;
    font-size: 0.9rem;
    display:flex
  }

  #menubar {
    flex-direction: row;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  #menubar button {
    width: 100%;
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  #start-section {
    padding-top: 6rem;
    font-size: 1.3rem;
  }

  #start-section h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  #start-section h3 {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }


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
