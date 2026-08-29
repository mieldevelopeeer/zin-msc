/**
 * Zin Music - Main Application Entry Point
 * Orchestrates Audio Engine, Player, Playlist Manager, Responsive Navigation, and UI
 */

document.addEventListener("DOMContentLoaded", () => {
  const audioElement = document.getElementById("main-audio-player");
  const audioEngine = new ZinAudioEngine(audioElement);
  const player = new ZinPlayer(audioEngine);
  const playlistManager = new ZinPlaylistManager();
  const ui = new ZinUI(player, playlistManager, audioEngine);

  const thumbnailManager = new ZinThumbnailManager();
  window.zinThumbnailManager = thumbnailManager;

  // Expose global singletons for inline handlers
  window.zinAudioEngine = audioEngine;
  window.zinPlayer = player;
  window.zinPlaylistManager = playlistManager;
  window.zinUI = ui;

  // Initialize UI
  ui.init();

  // Extract real video frames for all songs and clips
  thumbnailManager.extractAll();

  // Set default initial track into queue (without autoplay on initial page load)
  player.setQueue(CURATED_TRACKS, 0, false);

  // Helper for seek calculations
  const handleSeek = (element, clientX) => {
    const rect = element.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (clickX / rect.width) * 100;
    player.seek(percentage);
  };

  // Seek Bar Interactions (Desktop center bar)
  const seekBar = document.getElementById("seek-bar-container");
  if (seekBar) {
    seekBar.addEventListener("click", (e) => handleSeek(seekBar, e.clientX));
  }

  // Continuous Micro-Seekbar Interaction (Mobile top edge of mini-player)
  const microSeekBar = document.getElementById("player-progress-strip");
  if (microSeekBar) {
    microSeekBar.addEventListener("click", (e) => handleSeek(microSeekBar, e.clientX));
    
    // Mobile touch scrubber support
    microSeekBar.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length > 0) {
        handleSeek(microSeekBar, e.touches[0].clientX);
      }
    }, { passive: true });
  }

  // Volume Slider
  const volumeSlider = document.getElementById("volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      player.setVolume(e.target.value / 100);
    });
  }

  // Theme Toggle (Dark / Light)
  const themeBtn = document.getElementById("btn-toggle-theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      themeBtn.innerHTML = newTheme === "light" 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    });
  }

  // Sidebar Collapse Toggle (Desktop)
  const sidebarToggle = document.getElementById("btn-toggle-sidebar");
  const appContainer = document.getElementById("app-container");
  if (sidebarToggle && appContainer) {
    sidebarToggle.addEventListener("click", () => {
      appContainer.classList.toggle("sidebar-collapsed");
    });
  }

  // Right Drawer (Queue) Toggle with Backdrop Sync
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const toggleRightPanelBtn = document.getElementById("btn-toggle-right-panel");
  const closeRightPanelBtn = document.getElementById("btn-close-right-panel");

  const setRightPanelState = (isOpen) => {
    if (!appContainer) return;
    if (isOpen) {
      appContainer.classList.remove("right-panel-closed");
      if (drawerBackdrop) drawerBackdrop.classList.add("active");
      if (toggleRightPanelBtn) toggleRightPanelBtn.classList.add("active");
    } else {
      appContainer.classList.add("right-panel-closed");
      if (drawerBackdrop) drawerBackdrop.classList.remove("active");
      if (toggleRightPanelBtn) toggleRightPanelBtn.classList.remove("active");
    }
  };

  if (toggleRightPanelBtn && appContainer) {
    toggleRightPanelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isCurrentlyClosed = appContainer.classList.contains("right-panel-closed");
      setRightPanelState(isCurrentlyClosed);
    });
  }

  if (closeRightPanelBtn) {
    closeRightPanelBtn.addEventListener("click", () => {
      setRightPanelState(false);
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", () => {
      setRightPanelState(false);
    });
  }
});
