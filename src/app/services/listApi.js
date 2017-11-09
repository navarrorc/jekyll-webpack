import pnp, { SPRequestExecutorClient, Web } from "sp-pnp-js";

// initialize the object using the Web constructor function so that intellisense works in VsCode
let w = new Web("");

/**
 * pnp-js-core setup
 */
if (!window._spPageContextInfo) {
    let appWebUrl = "",
        hostWebUrl = "";

    // In development mode, using the WebViewer App
    try {
        appWebUrl = localStorage.getItem("SPAppWebUrl");
        hostWebUrl = localStorage.getItem("SPHostUrl");

        pnp.setup({
            baseUrl: appWebUrl,
            fetchClientFactory: () => {
                return new SPRequestExecutorClient();
            }
        });

        w = pnp.sp.crossDomainWeb(appWebUrl, hostWebUrl);
        pnp.sp.crossDomainWeb(appWebUrl, hostWebUrl);// so we can use the utilities

    } catch (error) {
        // console.log("Error setting up the app and host web URLs: ", error);
    }

}
else {
    w = new Web(window._spPageContextInfo.siteAbsoluteUrl);
    new Web(window._spPageContextInfo.siteAbsoluteUrl); // so we can use the utilities
}

/**
 * Methods to export
 */
function addToList() {

    let listName = "itops_optin";
    let pEmail = pnp.sp.utility.getCurrentUserEmailAddresses();

    return new Promise((resolve, reject) => {

        pEmail
            .then(email => {
                // check if item exists
                w.lists.getByTitle(listName).items.filter(`Title eq '${email}'`).get()
                    .then(r => {
                        // console.warn("Item exists result: ", JSON.stringify(r, null, 4));
                        if (r.length) {
                            // console.warn("Found Item");
                            resolve(false);
                        } else {
                            // console.warn("Item Not Found");
                            w.lists.getByTitle(listName).items.add({
                                Title: email
                            }).then((i) => {
                                // console.warn("item added: ", i);
                                resolve(true);
                            })
                        }
                    });
            })
            .catch(err => {
                reject(err);
                // console.warn("An error occurred", err);
            })

    });

}
export { addToList };


