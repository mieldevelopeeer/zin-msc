/**
 * Zin Music - Romantic UI Controller
 * Direct Video-Frame Driven Thumbnails & Clean Gift Interface
 */

class ZinUI {
  constructor(player, playlistManager, audioEngine) {
    this.player = player;
    this.playlistManager = playlistManager;
    this.audioEngine = audioEngine;
    this.activeMood = "all";
    this.currentView = "home";
  }

  init() {
    this.renderMoodChips();
    this.renderMainContent("home");
    this.setupEventListeners();
  }

  setupEventListeners() {
    const searchInput = document.getElementById("main-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length > 0) {
          this.renderSearchResults(query);
        } else {
          this.renderMainContent(this.currentView);
        }
      });
    }
  }

  renderMoodChips() {
    const container = document.getElementById("mood-chips-container");
    if (!container) return;

    container.innerHTML = MOOD_FILTERS.map(mood => `
      <button class="mood-chip ${this.activeMood === mood.id ? 'active' : ''}" onclick="window.zinUI.selectMood('${mood.id}')">
        ${mood.label}
      </button>
    `).join("");
  }

  selectMood(moodId) {
    this.activeMood = moodId;
    this.renderMoodChips();

    if (moodId === "all") {
      this.renderMainContent("home");
    } else {
      const filtered = CURATED_TRACKS.filter(t => t.moods.includes(moodId));
      this.renderFilteredMoodView(moodId, filtered);
    }
  }

  renderMainContent(view = "home") {
    this.currentView = view;
    const container = document.getElementById("main-scroll-content");
    if (!container) return;

    // Update Sidebar active state
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
    });
    const navActive = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navActive) navActive.classList.add("active");

    if (view === "home") {
      this.renderHomeView(container);
    } else if (view === "memories") {
      this.renderMemoriesView(container);
    } else if (view === "liked") {
      this.renderLikedSongsView(container);
    }
  }

  renderHomeView(container) {
    container.innerHTML = `
      <!-- Romantic Dedication Hero Card -->
      <div style="background: linear-gradient(135deg, rgba(255, 51, 102, 0.18), rgba(255, 200, 55, 0.12), rgba(18, 19, 28, 0.95)); border: 1px solid rgba(255, 100, 150, 0.35); border-radius: var(--radius-lg); padding: 36px 30px; margin-bottom: 32px; position: relative; overflow: hidden; box-shadow: 0 12px 36px rgba(255, 51, 102, 0.15);">
        <div style="position: absolute; right: 20px; bottom: 10px; font-size: 8rem; opacity: 0.08; pointer-events: none;">💖</div>
        <div style="max-width: 600px; position: relative; z-index: 1;">
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 51, 102, 0.2); border: 1px solid rgba(255, 51, 102, 0.4); padding: 5px 12px; border-radius: 999px; font-size: 0.76rem; font-weight: 800; color: #ff7597; text-transform: uppercase; margin-bottom: 12px;">
            <span>💖 Made With Love For You</span>
          </div>
          <h1 style="font-size: 2.3rem; line-height: 1.2; margin-bottom: 10px; color: #fff; font-family: 'Outfit', sans-serif;">Our Special Love Playlist</h1>
          <p style="color: var(--text-secondary); font-size: 0.94rem; margin-bottom: 22px; line-height: 1.5;">Every song here was chosen just for you. Sit back, put on your earphones, and let the music speak what words cannot describe.</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn-play-hero" style="background: var(--accent-gradient); box-shadow: 0 4px 20px var(--accent-love-glow);" onclick="window.zinPlayer.setQueue(CURATED_TRACKS, 0); window.zinPlayer.play();">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Play All Songs
            </button>
            <button class="btn-video-hero" style="border-color: rgba(255, 100, 150, 0.35);" onclick="window.zinPlayer.toggleShuffle(); window.zinPlayer.play();">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              Shuffle Playlist
            </button>
            <button class="btn-video-hero" style="background: rgba(255, 51, 102, 0.15); border-color: rgba(255, 51, 102, 0.35); color: #fff;" onclick="window.zinUI.openLoveLetterModal()">
              <span>💌 Read Love Note</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Our Memories Highlight Section -->
      <div style="margin-bottom: 36px;">
        <div class="section-header">
          <div>
            <div class="section-title">📸 Our Special Memory Clips</div>
            <div class="section-subtitle">Cherished moments captured in time (Plays individually with zero overlap)</div>
          </div>
          <button class="section-more-link" onclick="window.zinUI.renderMainContent('memories')">View All Memories →</button>
        </div>
        <div class="cards-grid">
          ${MEMORY_CLIPS.map(clip => `
            <div class="music-card" onclick="window.zinUI.openMemoryClip('${clip.id}')">
              <div class="card-img-wrapper" style="aspect-ratio: 16/10;">
                <video src="${clip.videoSrc}#t=1.0" class="card-video-thumb" preload="metadata" muted playsinline></video>
                <div class="card-badge" style="background: var(--accent-gradient); color: #fff;">MEMORIES</div>
                <button class="card-play-btn" style="background: var(--accent-gradient); color: #fff;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div class="card-title truncate" style="font-weight: 700;">${clip.title}</div>
              <div class="card-artist truncate" style="color: var(--accent-love-light); font-size: 0.82rem;">${clip.subtitle}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- All Our Songs Grid -->
      <div style="margin-bottom: 36px;">
        <div class="section-header">
          <div>
            <div class="section-title">✨ Our 8 Songs</div>
            <div class="section-subtitle">Click any track to listen & watch with synced lyrics</div>
          </div>
        </div>
        <div class="quick-picks-grid">
          ${CURATED_TRACKS.map(t => `
            <div class="quick-pick-item ${this.player.currentTrack && this.player.currentTrack.id === t.id ? 'active' : ''}" onclick="window.zinUI.playTrackById('${t.id}')">
              <div class="quick-pick-thumb">
                <video src="${t.videoSrc}#t=1.0" class="quick-pick-video-thumb" preload="metadata" muted playsinline></video>
              </div>
              <div class="quick-pick-info">
                <div class="quick-pick-title truncate" style="font-weight: 700; color: #fff;">${t.title}</div>
                <div class="quick-pick-artist truncate" style="color: var(--accent-love-light); font-size: 0.8rem;">${t.artist} • ${t.genre}</div>
              </div>
              <div class="quick-pick-actions" onclick="event.stopPropagation()">
                <button class="btn-item-like ${this.playlistManager.isLiked(t.id) ? 'liked' : ''}" onclick="window.zinUI.toggleLikeTrack('${t.id}')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="${this.playlistManager.isLiked(t.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Romantic Video Theater Quick Access -->
      <div style="margin-bottom: 30px;">
        <div class="section-header">
          <div>
            <div class="section-title">🎬 Video Theater & Visuals</div>
            <div class="section-subtitle">Watch with love lyrics and full ambient glow</div>
          </div>
        </div>
        <div class="cards-grid">
          ${CURATED_TRACKS.map(t => `
            <div class="music-card" onclick="window.zinUI.playTrackInVideoMode('${t.id}')">
              <div class="card-img-wrapper" style="aspect-ratio: 16/10;">
                <video src="${t.videoSrc}#t=1.0" class="card-video-thumb" preload="metadata" muted playsinline></video>
                <div class="card-badge" style="background: var(--accent-gradient); color: #fff;">OUR VIDEO</div>
                <button class="card-play-btn" style="background: var(--accent-gradient); color: #fff;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div class="card-title truncate">${t.title}</div>
              <div class="card-artist truncate" style="color: var(--text-secondary); font-size: 0.8rem;">${t.genre}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  renderMemoriesView(container) {
    container.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 30px; background: linear-gradient(135deg, rgba(255, 51, 102, 0.22), rgba(255, 200, 55, 0.1)); padding: 26px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 100, 150, 0.3);">
        <div style="width: 110px; height: 110px; border-radius: var(--radius-md); background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px var(--accent-love-glow); font-size: 3rem;">
          📸
        </div>
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--accent-love-light); letter-spacing: 0.08em;">Our Special Reel</div>
          <h1 style="font-size: 2.2rem; margin: 4px 0 6px; color: #fff;">Our Memories & Moments</h1>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Cherished video clips of our journey. Click any memory below to watch with clear sound.</p>
        </div>
      </div>

      <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px;">
        ${MEMORY_CLIPS.map(clip => `
          <div class="music-card" style="padding: 16px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);" onclick="window.zinUI.openMemoryClip('${clip.id}')">
            <div class="card-img-wrapper" style="aspect-ratio: 16/10; margin-bottom: 14px;">
              <video src="${clip.videoSrc}#t=1.0" class="card-video-thumb" preload="metadata" muted playsinline></video>
              <div class="card-badge" style="background: var(--accent-gradient); color: #fff;">PLAY CLIP</div>
              <button class="card-play-btn" style="background: var(--accent-gradient); color: #fff;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
            <div class="card-title truncate" style="font-size: 1.05rem; font-weight: 700; color: #fff;">${clip.title}</div>
            <div class="card-artist truncate" style="color: var(--accent-love-light); font-size: 0.84rem; margin-bottom: 8px;">${clip.subtitle}</div>
            <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; font-style: italic;">"${clip.note}"</p>
          </div>
        `).join("")}
      </div>
    `;
  }

  openMemoryClip(clipId) {
    const clip = MEMORY_CLIPS.find(c => c.id === clipId);
    if (!clip) return;

    // 1. Immediately pause background music so there is ZERO audio overlap!
    if (this.player) {
      this.player.pause();
    }

    const modal = document.getElementById("memory-modal");
    const video = document.getElementById("memory-clip-video");
    const titleEl = document.getElementById("memory-modal-title");
    const subtitleEl = document.getElementById("memory-modal-subtitle");
    const noteEl = document.getElementById("memory-modal-note");

    if (titleEl) titleEl.textContent = clip.title;
    if (subtitleEl) subtitleEl.textContent = clip.subtitle;
    if (noteEl) noteEl.textContent = `"${clip.note}"`;

    if (video) {
      video.muted = false; // Play clip's audio cleanly without any other sound
      video.src = clip.videoSrc;
      video.currentTime = 0;
      video.play().catch(() => {});
    }

    if (modal) modal.classList.add("open");
  }

  closeMemoryClip() {
    const modal = document.getElementById("memory-modal");
    const video = document.getElementById("memory-clip-video");
    if (video) {
      video.pause();
      video.src = "";
    }
    if (modal) modal.classList.remove("open");
  }

  renderLikedSongsView(container) {
    const likedTracks = this.playlistManager.getLikedTracks();

    container.innerHTML = `
      <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 30px; background: linear-gradient(135deg, rgba(255, 51, 102, 0.25), rgba(0,0,0,0.4)); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <div style="width: 130px; height: 130px; border-radius: var(--radius-md); background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px var(--accent-love-glow);">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--accent-love-light);">Love Collection</div>
          <h1 style="font-size: 2.2rem; margin: 4px 0 8px;">Favorite Love Songs</h1>
          <div style="color: var(--text-secondary); font-size: 0.88rem;">${likedTracks.length} tracks favorited with love</div>
        </div>
      </div>

      ${likedTracks.length === 0 ? `
        <div style="text-align: center; color: var(--text-muted); padding: 50px 0;">
          <div style="font-size: 1.1rem; margin-bottom: 8px;">No favorites saved yet</div>
          <p style="font-size: 0.85rem;">Click the heart icon on any of our songs to add them here.</p>
        </div>
      ` : `
        <div class="quick-picks-grid">
          ${likedTracks.map(t => `
            <div class="quick-pick-item" onclick="window.zinUI.playTrackById('${t.id}')">
              <div class="quick-pick-thumb">
                <video src="${t.videoSrc}#t=1.0" class="quick-pick-video-thumb" preload="metadata" muted playsinline></video>
              </div>
              <div class="quick-pick-info">
                <div class="quick-pick-title truncate">${t.title}</div>
                <div class="quick-pick-artist truncate">${t.artist} • ${t.genre}</div>
              </div>
              <div class="quick-pick-actions" onclick="event.stopPropagation()">
                <button class="btn-item-like liked" onclick="window.zinUI.toggleLikeTrack('${t.id}')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    `;
  }

  renderFilteredMoodView(moodId, tracks) {
    const container = document.getElementById("main-scroll-content");
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.8rem; margin-bottom: 4px;">${moodId} 💕</h2>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">Curated songs for this romantic vibe</p>
      </div>

      <div class="quick-picks-grid">
        ${tracks.map(t => `
          <div class="quick-pick-item" onclick="window.zinUI.playTrackById('${t.id}')">
            <div class="quick-pick-thumb">
              <video src="${t.videoSrc}#t=1.0" class="quick-pick-video-thumb" preload="metadata" muted playsinline></video>
            </div>
            <div class="quick-pick-info">
              <div class="quick-pick-title truncate">${t.title}</div>
              <div class="quick-pick-artist truncate">${t.artist} • ${t.genre}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  renderSearchResults(query) {
    const container = document.getElementById("main-scroll-content");
    if (!container) return;

    const results = CURATED_TRACKS.filter(t => 
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query)
    );

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.6rem; margin-bottom: 4px;">Search: "${query}"</h2>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">Found ${results.length} songs</p>
      </div>

      ${results.length === 0 ? `
        <div style="text-align: center; color: var(--text-muted); padding: 50px 0;">No songs found matching your search.</div>
      ` : `
        <div class="quick-picks-grid">
          ${results.map(t => `
            <div class="quick-pick-item" onclick="window.zinUI.playTrackById('${t.id}')">
              <div class="quick-pick-thumb">
                <video src="${t.videoSrc}#t=1.0" class="quick-pick-video-thumb" preload="metadata" muted playsinline></video>
              </div>
              <div class="quick-pick-info">
                <div class="quick-pick-title truncate">${t.title}</div>
                <div class="quick-pick-artist truncate">${t.artist}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    `;
  }

  playTrackById(trackId) {
    const track = CURATED_TRACKS.find(t => t.id === trackId);
    if (track) {
      this.player.setQueue(CURATED_TRACKS, CURATED_TRACKS.indexOf(track));
    }
  }

  playTrackInVideoMode(trackId) {
    this.playTrackById(trackId);
    this.player.setMode("video");
  }

  toggleLikeTrack(trackId) {
    const track = CURATED_TRACKS.find(t => t.id === trackId);
    if (track) {
      this.playlistManager.toggleLike(track);
      if (this.currentView === "liked") {
        this.renderLikedSongsView(document.getElementById("main-scroll-content"));
      } else {
        this.renderMainContent(this.currentView);
      }
    }
  }

  // Modals & Panels
  openLoveLetterModal() {
    const modal = document.getElementById("love-letter-modal");
    if (modal) modal.classList.add("open");
  }

  closeLoveLetterModal() {
    const modal = document.getElementById("love-letter-modal");
    if (modal) modal.classList.remove("open");
  }
}
