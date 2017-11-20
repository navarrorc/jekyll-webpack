import "@/sass/main.scss";
import Vue from "vue";
import message from "@/app/components/message/message.vue";

$(() => {
  new Vue({
    el: "#app",
    render: h => h(message)
  });
});

if (module.hot) {
  module.hot.accept();
}
