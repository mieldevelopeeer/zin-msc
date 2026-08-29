/**
 * Zin Music - Video Frame Thumbnail Generator
 * Dynamically extracts high-quality video frames from local MP4 video files
 * Caches thumbnails in localStorage for instant, offline loading
 */

class ZinThumbnailManager {
  constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const allItems = [...(typeof CURATED_TRACKS !== "undefined" ? CURATED_TRACKS : []), ...(typeof MEMORY_CLIPS !== "undefined" ? MEMORY_CLIPS : [])];
      allItems.forEach(item => {
        const cached = localStorage.getItem("zin_thumb_" + item.id);
        if (cached && cached.startsWith("data:image/")) {
          item.cover = cached;
          this.cache.set(item.id, cached);
        }
      });
    } catch (e) {
      console.warn("Could not load thumbnail cache from localStorage:", e);
    }
  }

  extractAll() {
    const allItems = [...(typeof CURATED_TRACKS !== "undefined" ? CURATED_TRACKS : []), ...(typeof MEMORY_CLIPS !== "undefined" ? MEMORY_CLIPS : [])];
    let index = 0;

    const processNext = () => {
      if (index >= allItems.length) return;
      const item = allItems[index++];
      const videoSrc = item.videoSrc;

      if (!videoSrc) {
        processNext();
        return;
      }

      this.extractFrame(videoSrc, 1.5, (dataUrl) => {
        if (dataUrl) {
          item.cover = dataUrl;
          this.cache.set(item.id, dataUrl);
          try {
            localStorage.setItem("zin_thumb_" + item.id, dataUrl);
          } catch (e) {}
          this.updateDOMCovers(item.id, dataUrl);
        }
        processNext();
      });
    };

    processNext();
  }

  extractFrame(videoUrl, seekTime, callback) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let hasExtracted = false;
    let timeoutId = setTimeout(() => {
      if (!hasExtracted) {
        cleanup();
        callback(null);
      }
    }, 4000);

    const onLoadedMetadata = () => {
      const duration = video.duration || 3;
      const timeToSeek = Math.min(seekTime, duration * 0.3);
      video.currentTime = timeToSeek > 0 ? timeToSeek : 0.5;
    };

    const onSeeked = () => {
      if (hasExtracted) return;
      hasExtracted = true;
      clearTimeout(timeoutId);

      try {
        const canvas = document.createElement("canvas");
        const videoW = video.videoWidth || 640;
        const videoH = video.videoHeight || 360;
        const aspect = videoW / videoH;
        canvas.width = 480;
        canvas.height = Math.round(480 / aspect);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        cleanup();
        callback(dataUrl);
      } catch (e) {
        cleanup();
        callback(null);
      }
    };

    const onError = () => {
      if (hasExtracted) return;
      hasExtracted = true;
      clearTimeout(timeoutId);
      cleanup();
      callback(null);
    };

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.src = "";
      video.load();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
  }

  updateDOMCovers(itemId, dataUrl) {
    const imgs = document.querySelectorAll(`img[data-cover-id="${itemId}"]`);
    imgs.forEach(img => {
      img.src = dataUrl;
    });

    // Update Player thumb if currently playing this item
    if (window.zinPlayer && window.zinPlayer.currentTrack && window.zinPlayer.currentTrack.id === itemId) {
      const playerThumb = document.getElementById("player-current-thumb");
      if (playerThumb) playerThumb.src = dataUrl;
    }
  }
}
