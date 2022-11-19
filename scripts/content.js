// TODO:
// - scaling issues with custom bar sizes
// - save offsets
// - multi video collision handler

let vid, canvas, ctx;
let x, y, width, height;
let ox = (oy = ow = oh = 0);

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
        if (clear) ctx.clearrect(0, 0, canvas.width, canvas.height);
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

const saveOffsets = () => {};

const hideSubs = () => {
    let pageURL = window.location.href;
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
    canvas.width = vw;
    canvas.height = vh;

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
        saveOffsets();
    });
};

const domain = new URL(location.href).hostname;
chrome.storage.sync.get(domain, function (data) {
    if (data[domain]["active"]) {
        hideSubs();
    }
});
