// Audio setup
navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

if (!navigator.getUserMedia) {
    throw new Error("Browser doesn't support getUserMedia.");
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

if (!audioCtx) {
    throw new Error("Browser doesn't support Web Audio API.");
}

console.log("Audio context:", audioCtx);

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 1024;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

console.log("Analyser:", analyser);

var sampleRate = audioCtx.sampleRate;

// Canvas setup
var canvas = document.getElementById('viz-canvas');
var canvasCtx = canvas.getContext('2d');

var W = canvas.width;
var H = canvas.height;
var unitSz = 2;
console.log("Unit size:", unitSz);
var unit = (len) => len * unitSz;

// Visualization
function visualize() {
    requestAnimationFrame(visualize);

    // Clear the canvas from last tick.
    canvasCtx.clearRect(0, 0, W, H);

    // Draw the non-moving line/underscore.
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.lineWidth = unit(4);
    canvasCtx.strokeRect(2, unit(128), unit(256)+2, unit(64));

    drawBaseLine();

    var barWidth = (W / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(x, H-barHeight/2, barWidth, barHeight/2);

        x += barWidth + 1;
    }
}

// Get microphone audio stream.
var stream = new Promise((resolve, reject) => {
    navigator.getUserMedia(
            {audio: true},
            (stream) => resolve(stream),
            (err) => reject(stream)
    );
})

stream
    // Create web audio source from mic stream.
    .then((stream) => audioCtx.createMediaStreamSource(stream))
    // Connect that source to the analyser.
    .then((source) => source.connect(analyser))
    // Start animation.
    .then(visualize);

// TODO: Fix exact placement.
