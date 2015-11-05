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

var freqAnalyser = audioCtx.createAnalyser();
freqAnalyser.fftSize = 2048;
var freqDataArray = new Uint8Array(freqAnalyser.frequencyBinCount);
var hzPerBin = Math.ceil((audioCtx.sampleRate / 2) / freqAnalyser.frequencyBinCount);

var splitter = audioCtx.createChannelSplitter(2);
var merger = audioCtx.createChannelMerger(2);
var leftAnalyser = audioCtx.createAnalyser();
var leftDataArray = new Uint8Array(leftAnalyser.frequencyBinCount);
var rightAnalyser = audioCtx.createAnalyser();
var rightDataArray = new Uint8Array(rightAnalyser.frequencyBinCount);

function freqCutoff(type, freq, freqband) {
    switch (type) {
        case 'low':
            var nBins = Math.round(freq / hzPerBin);
            var sum = freqDataArray.slice(0, nBins).reduce((pv, cv) => pv + cv, 0);
            return sum / nBins;

        case 'high':
            var band = (audioCtx.sampleRate / 2) - freq;
            var nBins = Math.round(band / hzPerBin);
            var sum = freqDataArray.slice(-nBins).reduce((pv, cv) => pv + cv, 0);
            return sum / nBins;

        case 'band':
            var nBins = Math.round((freqband - freq) / hzPerBin);
            var firstBin = Math.floor(freq / hzPerBin);
            var sum = freqDataArray.slice(firstBin, firstBin+nBins).reduce(
                    (pv, cv) => cv < 100 ? pv : pv + cv, 0);
            return sum / nBins;
    }
}

// Canvas setup
var canvas = document.getElementById('viz-canvas');
var canvasCtx = canvas.getContext('2d');

var W = canvas.width;
var H = canvas.height;
var unitSz = 2;
var unit = (len) => len * unitSz;

// Visualization
var leftMax = 128;
var rightMax = 128;

var lowFreqMax = 1;
var highFreqMax = 1;
function visualize() {
    // Clear canvas from last tick.
    canvasCtx.clearRect(0, 0, W, H);

    // Draw the base logo.
    canvasCtx.fillStyle = 'rgb(239, 74, 95)';
    //canvasCtx.lineWidth = unit(4);
    canvasCtx.fillRect(2, unit(128), unit(256)+2, unit(64));

    // Get audio data.
    freqAnalyser.getByteFrequencyData(freqDataArray);
    leftAnalyser.getByteFrequencyData(leftDataArray);
    rightAnalyser.getByteFrequencyData(rightDataArray);

    // Low freq viz
    var lowFreq = freqCutoff('low', 100);
    // Usually high saturation in low frequencies, tune this a bit.
    var lowFreq = Math.max(0, lowFreq - 100) + 0.1 * lowFreq;
    if (lowFreq > lowFreqMax) {
        lowFreqMax = lowFreq;
    }
    lowFreq = 255 * (lowFreq / lowFreqMax);

    canvasCtx.fillStyle = 'rgb(243, 119, 135)';
    canvasCtx.beginPath();
    canvasCtx.moveTo(2, unit(128 + 64));
    var lowX = unit(130) + unit(Math.random() * 128 - 64)
    var lowY = Math.min(H, unit(128+64) + (lowFreq / 255) * (H-unit(128+64)));
    canvasCtx.lineTo(lowX, lowY);
    var rightSum = rightDataArray.reduce((pv, cv) => pv + cv, 0);
    var rightAvg = Math.round(rightSum/rightAnalyser.frequencyBinCount);
    if (rightAvg > rightMax) rightMax = rightAvg;
    rightAvg = (rightAvg / rightMax) * 200;//256;
    canvasCtx.lineTo(unit(rightAvg)+2, unit(128 + 64));
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.fillStyle = 'rgb(247, 164, 175)';
    canvasCtx.moveTo(unit(rightAvg)+2, unit(128 + 64));
    canvasCtx.lineTo(lowX, lowY);
    canvasCtx.lineTo(unit(256)+4, unit(128) + unit(64));
    canvasCtx.fill();
   
    // High freq viz
    var highFreq = freqCutoff('high', 16000);
    if (highFreq > highFreqMax) {
        highFreqMax = highFreq;
    }
    highFreq = 255 * (highFreq / highFreqMax);

    canvasCtx.fillStyle = 'rgb(247, 164, 175)';
    canvasCtx.beginPath();
    canvasCtx.moveTo(2, unit(128));
    var highX = unit(130) + unit(Math.random() * 128 - 64)
    var highY = Math.min(unit(128), Math.max(2, ((unit(128)-highFreq) / 255) * unit(128)));
    canvasCtx.lineTo(highX, highY);
    var leftSum = leftDataArray.reduce((pv, cv) => pv + cv, 0);
    var leftAvg = Math.round(leftSum/leftAnalyser.frequencyBinCount);
    if (leftAvg > leftMax) leftMax = leftAvg;
    leftAvg = (leftAvg / leftMax) * 200;//256;
    canvasCtx.lineTo(unit(leftAvg)+2, unit(128));
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.fillStyle = 'rgb(250,200,207)';
    canvasCtx.moveTo(unit(leftAvg)+2, unit(128));
    canvasCtx.lineTo(highX, highY);
    canvasCtx.lineTo(unit(256)+4, unit(128));
    canvasCtx.fill();

    // Levels
    canvasCtx.fillStyle = 'rgb(235, 43, 56)';
    canvasCtx.beginPath();
    canvasCtx.moveTo(2, unit(128 + 64));
    canvasCtx.lineTo(unit(rightAvg)+2, unit(128 + 64));
    canvasCtx.lineTo(unit(leftAvg)+2, unit(128));
    canvasCtx.lineTo(2, unit(128));
    canvasCtx.fill()
    
    //requestAnimationFrame(visualize);
}

function connectChain(source) {
    source.connect(freqAnalyser);
    freqAnalyser.connect(splitter);
    splitter.connect(leftAnalyser, 0);
    splitter.connect(rightAnalyser, 1);
}

// Get microphone audio stream.
function useMicStream() {
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
        .then(connectChain)
        // Start animation.
        .then(setInterval(visualize, 1000/24));
}

function useMp3() {
    var audioElement = document.getElementById("mp3");
    var source = audioCtx.createMediaElementSource(audioElement);
    connectChain(source);

    // Connect to the output as well.
    leftAnalyser.connect(merger, 0, 0);
    rightAnalyser.connect(merger, 0, 1);
    merger.connect(audioCtx.destination);
    setInterval(visualize, 1000/24);
}

//visualize();
//useMp3();
useMicStream();
