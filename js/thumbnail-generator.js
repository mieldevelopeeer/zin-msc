/**
 * Zin Music - Video Frame Thumbnail Manager
 * Manages high-quality video snapshot thumbnails for all songs and clips
 */

class ZinThumbnailManager {
  constructor() {
    this.cache = new Map();
  }

  loadFromStorage() {
    // Thumbnails are now loaded from static optimized assets in thumbnails/
  }

  extractAll() {
    // Thumbnails are pre-generated and served statically for speed and Vercel CDN caching
  }

  updateDOMCovers(itemId, dataUrl) {
    const imgs = document.querySelectorAll(`img[data-cover-id="${itemId}"]`);
    imgs.forEach(img => {
      img.src = dataUrl;
    });

    if (window.zinPlayer && window.zinPlayer.currentTrack && window.zinPlayer.currentTrack.id === itemId) {
      const playerThumb = document.getElementById("player-current-thumb");
      if (playerThumb) playerThumb.src = dataUrl;
    }
  }
}
