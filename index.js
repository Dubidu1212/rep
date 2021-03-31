const app = Vue.createApp({
  el: '#app',
  data: function() {
    return{
      seen: true,
      message: 'Hello Vue!' + new Date().toLocaleString(),
      links: ["About.html","SkilltreeOverlay.css","bootstraptest.css","raphael-2.3.0","test","ContentNode.html","SkilltreeOverlay.html","bootstraptest.html","skilltree.css","README.md","SkilltreeOverlay.js","index.html","skilltree.html","SkilltreeBackend.js","SkilltreeOverlayDOM.js","konvajs.html","skilltree.js"]
    }
  },
 
})

app.component('paralax', {
  props: {
    src:{
      required: true
    },
    scrollSpeed:{
      default:1
    },
    direction:{
      default: 'Top',
      validator: function (value) {
        // The value must match one of these strings
        return ['Top', 'Left'].indexOf(value) !== -1
      }
    },
    margin:{
      default:0
    }

  },
  data: function () {
    return {
      styleObj: {
        marginTop: null,
        marginLeft: null
      }
    }
  },
  template: '<img v-bind:style="styleObj" :src="src" />',
  methods: {
    paralax: function(event){
      console.log("paralax");
      console.log(window.scrollY);
      let offset = window.scrollY;
      
      this.styleObj.marginTop = (offset*this.scrollSpeed + parseFloat(this.margin)) + "%";
      
      
    }
  },
  mounted(){
    this.paralax()
    document.addEventListener('scroll', this.paralax)
  },
  unmounted(){
    document.removeEventListener('scroll')
  }
})

app.component('dyn-box', {
  props: {
    scrollSpeedX: {
      default:0
    },
    scrollSpeedY:{
      default:0
    },
    marginX:{
      default:0
    },
    marginY:{
      default:0
    }
  },
  data: function () {
    return {
      styleObj: {
        marginTop: null,
        marginLeft: null,
      }
    }
  },
  template: '<div v-bind:style="styleObj"><slot></slot></div>',
  methods: {
    paralax: function(event){
      console.log("paralax");
      console.log(window.scrollY);
      let offset = window.scrollY;
      
      this.styleObj.marginLeft = offset*this.scrollSpeedX + this.marginX + "%";
      this.styleObj.marginTop = offset*this.scrollSpeedY + this.marginY + "%";
    }
  },
  mounted(){
    document.addEventListener('scroll', this.paralax)
  },
  unmounted(){
    document.removeEventListener('scroll')
  }
})



app.mount("#app");