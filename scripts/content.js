// TODO:
// - scaling issues with custom bar sizes

const domain = new URL(location.href).hostname;

let vid, canvas, ctx;
let x, y, width, height;
let ox = (oy = ow = oh = 0);
let picker;

function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
}

const rgbToString = (rgb) => {
    const { a, r, g, b } = rgb;
    return `rgba(${r},${g},${b},${a})`;
};

const paintBar = (clear = false) => {
    chrome.storage.sync.get("color", function (data) {
        let color = rgbToString(data.color);
        if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.fillRect(x + ox, y + oy, width + ow, height + oh);
    });
};

const paintInitialBar = (w, h) => {
    x = 0.1 * w;
    y = 0.8 * h;
    width = 0.8 * w;
    height = 0.1 * h;
    paintBar();
};

const cleanup = () => {
    canvas.remove();
    canvas = ctx = vid = null;
    ox = oy = ow = oh = 0;
};

const saveOffsets = () => {
    chrome.storage.sync.set({ [domain]: { active: true, ox, oy, ow, oh } });
};

const hideSubs = () => {
    let vids = document.getElementsByTagName("video");

    for (let video in vids) {
        let currVid = vids[video];

        if (
            isElement(currVid) &&
            currVid.src != "" &&
            currVid.style.display !== "none"
        ) {
            vid = vids[video];
            break;
        }
    }

    if (vid == null) {
        console.log("Video is null, trying again..");
        setTimeout(hideSubs, 1000);
        return;
    }

    const [vw, vh] = [vid.clientWidth, vid.clientHeight];
    canvas = document.createElement("canvas");
    canvas.id = "paintpad";
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = "none";
    canvas.width = vw;
    canvas.height = vh;

    vid.style.pointerEvents = "auto";
    vid.parentNode.insertBefore(canvas, vid.nextSibling);

    ctx = canvas.getContext("2d");

    paintInitialBar(vw, vh);

    const resizeObserver = new ResizeObserver(() => {
        const [vw, vh] = [vid.clientWidth, vid.clientHeight];
        canvas.width = vw;
        canvas.height = vh;
        paintInitialBar(vw, vh);
    });
    resizeObserver.observe(vid);

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey) {
            switch (e.keyCode) {
                case 37:
                    ox--;
                    break;
                case 38:
                    oy--;
                    break;
                case 39:
                    ox++;
                    break;
                case 40:
                    oy++;
                    break;
                case 190:
                    ow++;
                    break;
                case 188:
                    ow--;
                    break;
                case 219:
                    oh--;
                    break;
                case 221:
                    oh++;
                    break;
            }
        }

        paintBar(true);
    });
};

window.onbeforeunload = function () {
    saveOffsets();
};

chrome.storage.sync.get(domain, function (data) {
    if (data[domain]["active"]) {
        hideSubs();
    }

    ox = data[domain].ox || 0;
    oy = data[domain].oy || 0;
    oh = data[domain].oh || 0;
    ow = data[domain].ow || 0;
});

chrome.runtime.onMessage.addListener((msgObj) => {
    if (msgObj.pick) {
        document.body.style.background = "rgba(0,0,0,.5)";
        picker = new ElementPicker({
            selectors: "video",
            action: {
                trigger: "click",
                callback: function (target) {
                    picker.close();

                    if (target !== vid) {
                        document.body.style.background = "auto";
                        cleanup();
                        vid = target;
                        hideSubs();
                    }
                },
            },
        });
    }
});
