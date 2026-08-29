/**
 * Zin Music - Offline & Download Manager
 * Handles Direct File Downloads to Phone/PC, CacheStorage Offline Caching, and Offline State Tracking
 */

class ZinOfflineManager {
  constructor() {
    this.cacheName = "zin-love-cache-v1";
    this.cachedTrackIds = new Set();
    this.isDownloadingAll = false;
    this.init();
  }

  async init() {
    // Register Service Worker if supported
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("./sw.js");
        console.log("Offline Service Worker registered successfully.");
      } catch (err) {
        console.warn("Service Worker registration failed:", err);
      }
    }

    // Check which tracks are already cached
    await this.refreshCachedStatus();
  }

  async refreshCachedStatus() {
    if (!("caches" in window)) return;
    try {
      const cache = await caches.open(this.cacheName);
      if (typeof CURATED_TRACKS !== "undefined") {
        for (const track of CURATED_TRACKS) {
          const match = await cache.match(encodeURI(track.audioSrc));
          if (match) {
            this.cachedTrackIds.add(track.id);
          }
        }
      }
      this.updateOfflineBadgesInDOM();
    } catch (e) {}
  }

  isCached(trackId) {
    return this.cachedTrackIds.has(trackId);
  }

  /**
   * Direct Download & Cache for a Single Track
   */
  async downloadTrack(trackId) {
    const track = (typeof CURATED_TRACKS !== "undefined" ? CURATED_TRACKS : []).find(t => t.id === trackId);
    if (!track) return;

    this.showToast(`⏳ Saving "${track.title}" for offline listening...`);

    const fileUrl = encodeURI(track.audioSrc);
    const fileName = `Zin Music - ${track.title}.mp4`;

    try {
      // 1. Fetch file as blob
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.clone().blob();

      // 2. Save in CacheStorage for instant in-app offline playback
      if ("caches" in window) {
        const cache = await caches.open(this.cacheName);
        await cache.put(fileUrl, response);
        this.cachedTrackIds.add(track.id);
        this.updateOfflineBadgesInDOM();
      }

      // 3. Trigger direct browser download to device storage
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 2000);

      this.showToast(`✨ "${track.title}" downloaded & ready for offline! 💕`);
    } catch (err) {
      console.warn("Direct blob download fallback:", err);
      // Fallback direct link download
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showToast(`📥 Started downloading "${track.title}"`);
    }
  }

  /**
   * Direct Download & Cache for a Memory Clip
   */
  async downloadClip(clipId) {
    const clip = (typeof MEMORY_CLIPS !== "undefined" ? MEMORY_CLIPS : []).find(c => c.id === clipId);
    if (!clip) return;

    this.showToast(`⏳ Downloading "${clip.title}"...`);

    const fileUrl = encodeURI(clip.videoSrc);
    const fileName = `Zin Memory - ${clip.title}.mp4`;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.clone().blob();

      if ("caches" in window) {
        const cache = await caches.open(this.cacheName);
        await cache.put(fileUrl, response);
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 2000);

      this.showToast(`✨ Memory video downloaded! 🎬`);
    } catch (err) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  /**
   * Save All 8 Songs for Full Offline Experience
   */
  async saveAllSongsForOffline() {
    if (this.isDownloadingAll) return;
    if (typeof CURATED_TRACKS === "undefined" || CURATED_TRACKS.length === 0) return;

    this.isDownloadingAll = true;
    const btn = document.getElementById("btn-offline-all");
    const originalText = btn ? btn.innerHTML : "";

    const total = CURATED_TRACKS.length;
    let completed = 0;

    for (const track of CURATED_TRACKS) {
      if (btn) {
        btn.innerHTML = `<span>⏳ Saving (${completed + 1}/${total})...</span>`;
      }
      this.showToast(`💾 Caching ${track.title} (${completed + 1}/${total})...`);

      try {
        const url = encodeURI(track.audioSrc);
        const res = await fetch(url);
        if (res.ok && "caches" in window) {
          const cache = await caches.open(this.cacheName);
          await cache.put(url, res);
          this.cachedTrackIds.add(track.id);
        }
      } catch (e) {
        console.warn("Could not cache track:", track.title, e);
      }

      completed++;
    }

    this.isDownloadingAll = false;
    if (btn) {
      btn.innerHTML = `<span>✓ All Songs Saved Offline! 💕</span>`;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 4000);
    }

    this.updateOfflineBadgesInDOM();
    this.showToast(`🎉 All 8 songs are now saved and ready to play offline anytime! 💕`);
  }

  downloadCurrentTrack() {
    if (window.zinPlayer && window.zinPlayer.currentTrack) {
      this.downloadTrack(window.zinPlayer.currentTrack.id);
    } else if (typeof CURATED_TRACKS !== "undefined" && CURATED_TRACKS.length > 0) {
      this.downloadTrack(CURATED_TRACKS[0].id);
    }
  }

  updateOfflineBadgesInDOM() {
    document.querySelectorAll(".quick-pick-item").forEach(item => {
      const trackId = item.getAttribute("data-track-id");
      if (trackId && this.cachedTrackIds.has(trackId)) {
        const badge = item.querySelector(".offline-cached-badge");
        if (badge) badge.classList.add("visible");
      }
    });
  }

  /**
   * Floating Toast Notification
   */
  showToast(message) {
    let toast = document.getElementById("zin-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "zin-toast";
      toast.className = "zin-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = message;
    toast.classList.add("show");

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }
}
