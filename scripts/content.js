const color = [255, 255, 255];
let vid, canvas, ctx;
let x, y, width, height;

function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
}

const paintBar = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    ctx.fillRect(x, y, width, height);
};

const paintInitialBar = (w, h) => {
    x = 0.1 * w;
    y = 0.8 * h;
    width = 0.8 * w;
    height = 0.1 * h;
    paintBar();
};

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

    // uncomment these 4 lines if clicking wont pause the vid
    if (!pageURL.includes("www.youtube.com")) {
        canvas.addEventListener("click", function () {
            if (vid.paused) vid.play();
            else vid.pause();
        });
    }

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
                    x--;
                    break;
                case 38:
                    y--;
                    break;
                case 39:
                    x++;
                    break;
                case 40:
                    y++;
                    break;
                case 190:
                    width++;
                    break;
                case 188:
                    width--;
                    break;
                case 219:
                    height--;
                    break;
                case 221:
                    height++;
                    break;
            }
        }

        paintBar();
    });
};

hideSubs();
