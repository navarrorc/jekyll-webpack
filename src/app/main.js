import "@/sass/main.scss";
import Vue from "vue";
import message from "@/app/components/message/message.vue";


// function getParameterByName(name, url) {
//     if (!url) url = window.location.href;
//     name = name.replace(/[[\]]/g, "\\$&");
//     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return "";
//     return decodeURIComponent(results[2].replace(/\+/g, " "));
// }

// let pathname = window.location.pathname.toLowerCase();

$(() => {

    console.log("In main.js");

    // if (!window._spPageContextInfo) {
    //     let appWebUrl,
    //         hostWebUrl;

    //     // In development mode, using the WebViewer App
    //     appWebUrl = getParameterByName("SPAppWebUrl");
    //     hostWebUrl = getParameterByName("SPHostUrl");

    //     if (appWebUrl && hostWebUrl) {
    //         localStorage.setItem("SPAppWebUrl", appWebUrl);
    //         localStorage.setItem("SPHostUrl", hostWebUrl);
    //     }
    //     // else {
    //     //     appWebUrl = localStorage.getItem("SPAppWebUrl");
    //     //     hostWebUrl = localStorage.getItem("SPHostUrl");
    //     // }
    // } else {
    //     localStorage.setItem("SPHostUrl", window._spPageContextInfo.siteAbsoluteUrl);
    // }

    // capture username and add to List (itops_optin)
    // addToList();

    new Vue({
        el: "#app",
        render: h => h(message)
    })

})

if (module.hot) {
    module.hot.accept();
}
