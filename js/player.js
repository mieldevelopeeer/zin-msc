/**
 * Zin Music - Core Player Controller
 * Handles Audio Playback, Video Mode Switching, Queue, Shuffling, and Video Frame Thumbnails
 */

class ZinPlayer {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.audio = document.getElementById("main-audio-player");
    this.videoEl = document.getElementById("theater-video");
    this.currentTrack = null;
    this.isPlaying = false;
    this.mode = "audio"; // 'audio' or 'video'
    this.isShuffle = false;
    this.repeatMode = "off"; // 'off', 'all', 'one'
    this.queue = [];
    this.queueIndex = -1;
    this.history = [];
    this.volume = 0.8;
    this.isMuted = false;

    this.initAudioListeners();
  }

  initAudioListeners() {
    this.audio.volume = this.volume;

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.audioEngine.resume();
      this.updatePlayStateUI();
      if (this.videoEl && this.videoEl.src && this.mode === "video" && this.videoEl.paused) {
        this.videoEl.muted = true;
        this.videoEl.play().catch(() => {});
      }
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.updatePlayStateUI();
      if (this.videoEl && !this.videoEl.paused) {
        this.videoEl.pause();
      }
    });

    this.audio.addEventListener("timeupdate", () => {
      this.onTimeUpdate();
      if (this.videoEl && this.mode === "video") {
        if (Math.abs(this.videoEl.currentTime - this.audio.currentTime) > 0.4) {
          this.videoEl.currentTime = this.audio.currentTime;
        }
      }
    });

    this.audio.addEventListener("ended", () => {
      this.onTrackEnded();
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.updateDurationUI();
    });

    if (this.videoEl) {
      this.videoEl.muted = true; // Always mute video tag to prevent double audio overlay!
      this.videoEl.addEventListener("play", () => {
        if (this.audio.paused) this.play();
      });
      this.videoEl.addEventListener("pause", () => {
        if (!this.audio.paused && this.mode === "video") this.pause();
      });
      this.videoEl.addEventListener("seeking", () => {
        if (Math.abs(this.audio.currentTime - this.videoEl.currentTime) > 0.3) {
          this.audio.currentTime = this.videoEl.currentTime;
        }
      });
    }
  }

  loadTrack(track, autoplay = true) {
    if (!track) return;
    this.currentTrack = track;
    this.audio.src = track.audioSrc;

    this.updateTrackMetaUI(track);
    this.updateAmbientGlow(track.ambientGlow);
    this.updateVideoEmbed(track);

    if (autoplay) {
      this.audioEngine.init();
      this.play();
    }
  }

  play() {
    this.audioEngine.init();
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayStateUI();
    }).catch(e => {
      // User gesture needed for first play
      this.isPlaying = false;
      this.updatePlayStateUI();
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayStateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (!this.currentTrack && this.queue.length > 0) {
        this.playQueueIndex(0);
      } else {
        this.play();
      }
    }
  }

  next() {
    if (this.queue.length === 0) return;

    if (this.isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * this.queue.length);
      } while (nextIndex === this.queueIndex && this.queue.length > 1);
      this.playQueueIndex(nextIndex);
    } else {
      let nextIndex = this.queueIndex + 1;
      if (nextIndex >= this.queue.length) {
        if (this.repeatMode === "all") {
          nextIndex = 0;
        } else {
          return; // Stop at end of queue
        }
      }
      this.playQueueIndex(nextIndex);
    }
  }

  prev() {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    if (this.queue.length === 0) return;

    let prevIndex = this.queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.repeatMode === "all" ? this.queue.length - 1 : 0;
    }
    this.playQueueIndex(prevIndex);
  }

  seek(percentage) {
    if (!this.audio.duration) return;
    const targetTime = (percentage / 100) * this.audio.duration;
    this.audio.currentTime = targetTime;
    if (this.videoEl && this.mode === "video") {
      this.videoEl.currentTime = targetTime;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
    this.isMuted = this.volume === 0;
    this.updateVolumeUI();
  }

  toggleMute() {
    if (this.isMuted) {
      this.isMuted = false;
      this.audio.volume = this.volume || 0.8;
    } else {
      this.isMuted = true;
      this.audio.volume = 0;
    }
    this.updateVolumeUI();
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    const btn = document.getElementById("btn-shuffle");
    if (btn) btn.classList.toggle("active", this.isShuffle);
  }

  toggleRepeat() {
    const modes = ["off", "all", "one"];
    const nextIdx = (modes.indexOf(this.repeatMode) + 1) % modes.length;
    this.repeatMode = modes[nextIdx];

    const btn = document.getElementById("btn-repeat");
    if (btn) {
      btn.classList.toggle("active", this.repeatMode !== "off");
      btn.classList.toggle("repeat-one", this.repeatMode === "one");
      btn.title = `Repeat: ${this.repeatMode.toUpperCase()}`;
    }
  }

  setMode(mode) {
    this.mode = mode; // 'audio' or 'video'
    const audioBtn = document.getElementById("mode-btn-audio");
    const videoBtn = document.getElementById("mode-btn-video");
    const theaterView = document.getElementById("theater-view");

    if (mode === "video") {
      if (audioBtn) audioBtn.classList.remove("active");
      if (videoBtn) videoBtn.classList.add("active");
      if (theaterView) theaterView.classList.add("open");
      if (this.currentTrack) {
        this.updateVideoEmbed(this.currentTrack);
      }
      if (this.videoEl && this.isPlaying) {
        this.videoEl.muted = true;
        this.videoEl.currentTime = this.audio.currentTime || 0;
        this.videoEl.play().catch(() => {});
      }
    } else {
      if (videoBtn) videoBtn.classList.remove("active");
      if (audioBtn) audioBtn.classList.add("active");
      if (theaterView) theaterView.classList.remove("open");
      if (this.videoEl) {
        this.videoEl.pause();
      }
    }
  }

  setQueue(trackList, startIndex = 0, autoplay = true) {
    this.queue = [...trackList];
    this.playQueueIndex(startIndex, autoplay);
  }

  addToQueue(track) {
    this.queue.push(track);
    this.renderQueueUI();
  }

  playQueueIndex(index, autoplay = true) {
    if (index >= 0 && index < this.queue.length) {
      this.queueIndex = index;
      this.loadTrack(this.queue[index], autoplay);
      this.renderQueueUI();
    }
  }

  onTrackEnded() {
    if (this.repeatMode === "one") {
      this.audio.currentTime = 0;
      this.play();
    } else {
      this.next();
    }
  }

  onTimeUpdate() {
    const current = this.audio.currentTime || 0;
    const total = this.audio.duration || 0;

    // Update Progress Bar
    const percent = total > 0 ? (current / total) * 100 : 0;
    const fill = document.getElementById("seek-bar-fill");
    if (fill) fill.style.width = `${percent}%`;

    const timeCurr = document.getElementById("time-current");
    if (timeCurr) timeCurr.textContent = this.formatTime(current);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  updateDurationUI() {
    const timeTotal = document.getElementById("time-total");
    if (timeTotal && this.audio.duration) {
      timeTotal.textContent = this.formatTime(this.audio.duration);
    }
  }

  updatePlayStateUI() {
    const playIcons = document.querySelectorAll(".play-state-icon");
    const thumb = document.getElementById("player-current-thumb");

    playIcons.forEach(icon => {
      if (this.isPlaying) {
        icon.innerHTML = `<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      } else {
        icon.innerHTML = `<path fill="currentColor" d="M8 5v14l11-7z"/>`;
      }
    });

    if (thumb) {
      if (this.isPlaying) thumb.classList.add("spinning");
      else thumb.classList.remove("spinning");
    }
  }

  updateTrackMetaUI(track) {
    const titleEl = document.getElementById("player-title");
    const artistEl = document.getElementById("player-artist");
    const thumbEl = document.getElementById("player-current-thumb");
    const bannerTitle = document.getElementById("vis-current-title");

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (thumbEl && track.videoSrc) thumbEl.src = track.videoSrc + "#t=1.0";
    if (bannerTitle) bannerTitle.textContent = `${track.title} • ${track.artist}`;

    // Update Favorite heart state
    const favBtn = document.getElementById("btn-player-fav");
    if (favBtn && window.zinPlaylistManager) {
      const isLiked = window.zinPlaylistManager.isLiked(track.id);
      favBtn.classList.toggle("liked", isLiked);
      favBtn.innerHTML = isLiked
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    }
  }

  updateAmbientGlow(color) {
    const glowEl = document.getElementById("ambient-glow");
    if (glowEl && color) {
      glowEl.style.background = `radial-gradient(circle at 75% 20%, ${color}, transparent 50%),
                                 radial-gradient(circle at 25% 80%, rgba(255, 0, 51, 0.15), transparent 50%),
                                 radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.1), transparent 60%)`;
    }
  }

  updateVideoEmbed(track) {
    if (!track) return;
    const video = document.getElementById("theater-video");
    if (video && track.videoSrc) {
      video.muted = true; // Never play duplicate audio
      if (video.src !== track.videoSrc && !video.src.endsWith(encodeURI(track.videoSrc))) {
        video.src = track.videoSrc;
      }
      video.currentTime = this.audio.currentTime || 0;
      if (this.isPlaying && this.mode === "video") {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }

  updateVolumeUI() {
    const slider = document.getElementById("volume-slider");
    const icon = document.getElementById("volume-icon");
    if (slider) slider.value = this.isMuted ? 0 : this.volume * 100;
    if (icon) {
      if (this.isMuted || this.volume === 0) {
        icon.innerHTML = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
      } else if (this.volume < 0.5) {
        icon.innerHTML = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>`;
      } else {
        icon.innerHTML = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
      }
    }
  }

  renderQueueUI() {
    const listEl = document.getElementById("queue-items-container");
    if (!listEl) return;

    if (this.queue.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px 0; font-size: 0.85rem;">Queue is empty</div>`;
      return;
    }

    listEl.innerHTML = this.queue.map((track, idx) => `
      <div class="queue-item ${idx === this.queueIndex ? 'active' : ''}" onclick="window.zinPlayer.playQueueIndex(${idx})">
        <div class="queue-thumb">
          <video src="${track.videoSrc}#t=1.0" class="queue-video-thumb" preload="metadata" muted playsinline></video>
        </div>
        <div class="queue-info">
          <div class="queue-title truncate">${track.title}</div>
          <div class="queue-artist truncate">${track.artist}</div>
        </div>
        <span style="font-size: 0.72rem; color: var(--text-muted);">${this.formatTime(track.duration)}</span>
      </div>
    `).join("");
  }
}
