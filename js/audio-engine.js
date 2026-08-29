/**
 * Zin Music - Web Audio API Engine
 * Manages AnalyserNode for Visualizers, 5-Band Graphic Equalizer, and 8D Spatial Audio
 */

class ZinAudioEngine {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.ctx = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.pannerNode = null;
    this.isInitialized = false;

    // 5-Band EQ Filter nodes
    this.eqFrequencies = [60, 250, 1000, 4000, 14000];
    this.eqFilters = [];

    // 8D Audio state
    this.is8DEnabled = false;
    this.spatialPhase = 0;
    this.spatialSpeed = 0.02; // Rotation speed
    this.animationFrameId = null;

    // Visualizer canvas state
    this.canvas = null;
    this.canvasCtx = null;
    this.visualizerMode = "bars"; // 'bars', 'circle', 'wave'
    this.visAnimId = null;
  }

  init() {
    if (this.isInitialized) {
      this.resume();
      return;
    }

    const isFileProtocol = window.location.protocol === "file:";

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();

      // On file:/// protocol, Chromium blocks MediaElementAudioSource and mutes audio output.
      // We skip createMediaElementSource on file:/// so the audio plays smoothly via HTML5 audio.
      if (!isFileProtocol) {
        // Create Source from HTML5 Audio Element
        this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);

        // Create Analyser
        this.analyserNode = this.ctx.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.analyserNode.smoothingTimeConstant = 0.8;

        // Create 5-band BiquadFilter EQ Nodes
        let lastNode = this.sourceNode;

        this.eqFilters = this.eqFrequencies.map((freq, index) => {
          const filter = this.ctx.createBiquadFilter();
          if (index === 0) {
            filter.type = "lowshelf";
          } else if (index === this.eqFrequencies.length - 1) {
            filter.type = "highshelf";
          } else {
            filter.type = "peaking";
            filter.Q.value = 1.4;
          }
          filter.frequency.value = freq;
          filter.gain.value = 0;

          lastNode.connect(filter);
          lastNode = filter;
          return filter;
        });

        // Create Stereo Panner for 8D Audio
        if (this.ctx.createStereoPanner) {
          this.pannerNode = this.ctx.createStereoPanner();
          lastNode.connect(this.pannerNode);
          lastNode = this.pannerNode;
        }

        // Connect to Analyser and then to Destination
        lastNode.connect(this.analyserNode);
        this.analyserNode.connect(this.ctx.destination);
      }

      this.isInitialized = true;
      this.startSpatialLoop();
    } catch (e) {
      console.warn("Web Audio API running in safe playback mode:", e);
    }
  }

  resume() {
    try {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  setEqBand(bandIndex, gainValue) {
    if (this.eqFilters[bandIndex]) {
      this.eqFilters[bandIndex].gain.value = parseFloat(gainValue);
    }
  }

  applyPreset(presetName) {
    const presets = {
      flat: [0, 0, 0, 0, 0],
      bass: [8, 5, 1, -1, -2],
      vocal: [-2, 1, 6, 4, 1],
      electronic: [7, 4, -1, 5, 6],
      acoustic: [3, 2, 4, 3, 2],
      rock: [6, 3, -2, 4, 7]
    };

    const values = presets[presetName] || presets.flat;
    values.forEach((gain, idx) => {
      this.setEqBand(idx, gain);
    });
    return values;
  }

  toggle8D(enable) {
    this.is8DEnabled = enable !== undefined ? enable : !this.is8DEnabled;
    if (!this.is8DEnabled && this.pannerNode) {
      this.pannerNode.pan.value = 0;
    }
    return this.is8DEnabled;
  }

  startSpatialLoop() {
    const loop = () => {
      if (this.is8DEnabled && this.pannerNode && this.audioElement && !this.audioElement.paused) {
        this.spatialPhase += this.spatialSpeed;
        this.pannerNode.pan.value = Math.sin(this.spatialPhase);
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  // Visualizer Canvas Connection
  bindCanvas(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;
    this.canvasCtx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.startVisualizerLoop();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
  }

  setVisualizerMode(mode) {
    this.visualizerMode = mode;
  }

  startVisualizerLoop() {
    const draw = () => {
      this.visAnimId = requestAnimationFrame(draw);
      if (!this.canvas || !this.canvasCtx) return;

      const width = this.canvas.width;
      const height = this.canvas.height;
      const ctx = this.canvasCtx;

      ctx.clearRect(0, 0, width, height);

      const isPlaying = this.audioElement && !this.audioElement.paused;

      if (!isPlaying) {
        // Draw gentle idle wave when paused
        this.drawIdleEffect(ctx, width, height);
        return;
      }

      let dataArray;
      let bufferLength = 128;

      if (this.analyserNode) {
        bufferLength = this.analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        this.analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Procedural frequency generator for file:/// protocol
        dataArray = new Uint8Array(bufferLength);
        const time = (this.audioElement ? this.audioElement.currentTime : 0) * 8;
        for (let i = 0; i < bufferLength; i++) {
          const wave1 = Math.sin(time + i * 0.2);
          const wave2 = Math.cos(time * 0.7 + i * 0.15);
          const val = Math.max(0, Math.min(255, (wave1 + wave2 + 2) * 55 + (Math.sin(time * 2) * 20)));
          dataArray[i] = val;
        }
      }

      if (this.visualizerMode === "bars") {
        this.drawNeonBars(ctx, width, height, dataArray, bufferLength);
      } else if (this.visualizerMode === "circle") {
        this.drawGalaxyRing(ctx, width, height, dataArray, bufferLength);
      } else if (this.visualizerMode === "wave") {
        this.drawCyberWave(ctx, width, height, dataArray, bufferLength);
      }
    };
    draw();
  }

  drawNeonBars(ctx, width, height, dataArray, bufferLength) {
    const barCount = 48;
    const barWidth = (width / barCount) * 0.7;
    const step = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step] || 0;
      const barHeight = (value / 255) * height * 0.85;
      const x = i * (width / barCount) + (width / barCount - barWidth) / 2;
      const y = height - barHeight;

      // Gradient color (Spotify Green -> Cyan -> YT Red)
      const grad = ctx.createLinearGradient(x, height, x, y);
      grad.addColorStop(0, "#1ed760");
      grad.addColorStop(0.5, "#00f2fe");
      grad.addColorStop(1, "#ff0055");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Top Glow Dot
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x + barWidth / 2, y + 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGalaxyRing(ctx, width, height, dataArray, bufferLength) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.45;
    const barCount = 64;
    const step = Math.floor(bufferLength / barCount);

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step] || 0;
      const barLength = (value / 255) * 60;
      const angle = (i / barCount) * Math.PI * 2;

      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle) * (radius + barLength);
      const y2 = Math.sin(angle) * (radius + barLength);

      ctx.strokeStyle = `hsl(${(i * 5) + 120}, 100%, 65%)`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCyberWave(ctx, width, height, dataArray, bufferLength) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00f2fe";
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  drawIdleEffect(ctx, width, height) {
    const time = Date.now() * 0.002;
    ctx.strokeStyle = "rgba(30, 215, 96, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x += 10) {
      const y = height / 2 + Math.sin(x * 0.02 + time) * 12;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
