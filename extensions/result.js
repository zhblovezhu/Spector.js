//_______________________________EXTENSION POLYFILL_____________________________________
window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome ||
    browser;
})();

function sendMessage(message) {
    if (window["safari"]) {
        safari.self.tab.dispatchMessage("message", message);
        return;
    }

    window.browser.tabs.query({ active: true }, function(tabs) { 
        window.browser.tabs.sendMessage(tabs[0].id, message, function(response) { }); 
    });
};
//_____________________________________________________________________________________

var ui = null;

window.addEventListener("DOMContentLoaded", function() {
    ui = new SPECTOR.EmbeddedFrontend.ResultView({ 
        eventConstructor: SPECTOR.Utils.Event,
    }, new SPECTOR.Utils.ConsoleLogger());
    ui.display();

    // On first load collect and display the capture from the background page.
    var bgPage = browser.extension.getBackgroundPage();
    addCaptureFromString(bgPage.currentCaptureInString);
    bgPage.currentCaptureInString = null;
});

var addCaptureFromString = function(captureInString) {
    if (ui && captureInString) {
        ui.addCapture(JSON.parse(captureInString));
    }
}