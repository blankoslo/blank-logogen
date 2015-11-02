// Audio setup
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

if (!audioCtx) {
    throw new Error("Browser doesn't support Web Audio API.");
}

var audioElement = document.getElementById("mp3");
var source = audioCtx.createMediaElementSource(audioElement);

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

function freqCutoff(type, freq) {
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
//var lowX = unit(130);
//var highX = unit(130);
function visualize() {
    //requestAnimationFrame(visualize);

    // Clear canvas from last tick.
    canvasCtx.clearRect(0, 0, W, H);

    // Draw the base logo.
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.lineWidth = unit(4);
    canvasCtx.strokeRect(2, unit(128), unit(256)+2, unit(64));

    freqAnalyser.getByteFrequencyData(freqDataArray);

    // Low freq viz
    var lowFreq = freqCutoff('low', 100);
    canvasCtx.beginPath();
    canvasCtx.moveTo(2, unit(128 + 64));
    var lowX = unit(130) + unit(Math.random() * 128 - 64)
    //lowX += (Math.random()*20)-10
    var lowY = Math.min(H, unit(128+64) + lowFreq * (255/(H-unit(128+64))));
    canvasCtx.lineTo(lowX, lowY);
    canvasCtx.lineTo(unit(256)+4, unit(128) + unit(64));
    canvasCtx.stroke();
   
    // High freq viz
    var highFreq = freqCutoff('high', 16000);
    canvasCtx.beginPath();
    canvasCtx.moveTo(2, unit(128));
    var highX = unit(130) + unit(Math.random() * 128 - 64)
    //highX += (Math.random()*20)-10
    var highY = Math.min(unit(128), Math.max(2, unit(128)-highFreq*(255/(unit(128)))));
    canvasCtx.lineTo(highX, highY);
    canvasCtx.lineTo(unit(256)+4, unit(128));
    canvasCtx.stroke(); 

    // Right level viz
    rightAnalyser.getByteFrequencyData(rightDataArray);
    var rightSum = rightDataArray.reduce((pv, cv) => pv + cv, 0);
    var rightAvg = Math.round(rightSum/rightAnalyser.frequencyBinCount);
    canvasCtx.beginPath();
    canvasCtx.moveTo(unit(rightAvg)+2, unit(128 + 64));
    canvasCtx.lineTo(lowX, lowY);
    canvasCtx.stroke()

    // Left level viz
    leftAnalyser.getByteFrequencyData(leftDataArray);
    var leftSum = leftDataArray.reduce((pv, cv) => pv + cv, 0);
    var leftAvg = Math.round(leftSum/leftAnalyser.frequencyBinCount);
    canvasCtx.beginPath();
    canvasCtx.moveTo(unit(leftAvg)+2, unit(128));
    canvasCtx.lineTo(highX, highY);
    canvasCtx.stroke()

    // Between levels
    canvasCtx.beginPath();
    canvasCtx.moveTo(unit(rightAvg)+2, unit(128 + 64));
    canvasCtx.lineTo(unit(leftAvg)+2, unit(128));
    canvasCtx.stroke()
}

source.connect(freqAnalyser);
freqAnalyser.connect(splitter);
splitter.connect(leftAnalyser, 0);
splitter.connect(rightAnalyser, 1);
leftAnalyser.connect(merger, 0, 0);
rightAnalyser.connect(merger, 0, 1);
merger.connect(audioCtx.destination);

setInterval(visualize, 1000/24);

//visualize();
// TODO: Fix exact placement.
// TODO: Tune frequencies.
