/*
 */

const rgbToString = (rgb) => {
    const { a, r, g, b } = rgb;
    return `rgba(${r},${g},${b},${a})`;
};

const checkbox = document.querySelector("#checkbox");
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    const url = new URL(tab.url);
    const domain = url.hostname;
    chrome.storage.sync.get(domain, function(data) {
        checkbox.checked = data[domain]["active"];
    });
});

checkbox.addEventListener("change", (event) => {
    const checked = event.currentTarget.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        const url = new URL(tab.url);
        const domain = url.hostname;
        chrome.storage.sync.set({ [domain]: { active: checked } });
    });
});

const configurePicker = (color) => {
    const alwan = new Alwan("#color-picker", {
        theme: "dark",
        color: rgbToString(color),
        default: rgbToString(color),
    });

    alwan.on("change", function(colorObject, source) {
        const color = colorObject.rgb();
        chrome.storage.sync.set({ color });
    });
};

chrome.storage.sync.get("color", (data) => {
    configurePicker(data.color);
});

// video toggle
const pickVidBtn = document.querySelector(".pick-vid");
pickVidBtn.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, { pick: true });
    });
    window.close();
};
