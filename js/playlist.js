/**
 * Zin Music - Playlist & Library Manager
 * Handles Custom Playlists, Liked Songs, LocalStorage persistence, and Local MP3 drop
 */

class ZinPlaylistManager {
  constructor() {
    // Only allow valid zin-list track IDs
    const validTrackIds = new Set(CURATED_TRACKS.map(t => t.id));
    const savedLiked = JSON.parse(localStorage.getItem("zin_liked_tracks") || "[]");
    this.likedTrackIds = new Set(savedLiked.filter(id => validTrackIds.has(id)));

    const savedPlaylists = JSON.parse(localStorage.getItem("zin_user_playlists") || "[]");
    this.userPlaylists = savedPlaylists.map(pl => ({
      ...pl,
      trackIds: (pl.trackIds || []).filter(id => validTrackIds.has(id))
    }));

    this.localFiles = [];
    this.currentView = "home";
    this.activePlaylistId = null;
    this.save();
  }

  save() {
    localStorage.setItem("zin_liked_tracks", JSON.stringify(Array.from(this.likedTrackIds)));
    localStorage.setItem("zin_user_playlists", JSON.stringify(this.userPlaylists));
  }

  isLiked(trackId) {
    return this.likedTrackIds.has(trackId);
  }

  toggleLike(track) {
    if (!track) return false;
    if (this.likedTrackIds.has(track.id)) {
      this.likedTrackIds.delete(track.id);
    } else {
      this.likedTrackIds.add(track.id);
    }
    this.save();
    this.renderSidebarPlaylists();
    
    // Update player heart if currently playing this track
    if (window.zinPlayer && window.zinPlayer.currentTrack && window.zinPlayer.currentTrack.id === track.id) {
      window.zinPlayer.updateTrackMetaUI(track);
    }
    return this.isLiked(track.id);
  }

  getLikedTracks() {
    const allTracks = [...CURATED_TRACKS, ...this.localFiles];
    return allTracks.filter(t => this.likedTrackIds.has(t.id));
  }

  createPlaylist(title, description = "") {
    const newPlaylist = {
      id: "upl-" + Date.now(),
      title: title.trim() || "My Zin Playlist",
      subtitle: description.trim() || "Created in Zin Music",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
      trackIds: []
    };
    this.userPlaylists.unshift(newPlaylist);
    this.save();
    this.renderSidebarPlaylists();
    return newPlaylist;
  }

  addTrackToPlaylist(playlistId, trackId) {
    const pl = this.userPlaylists.find(p => p.id === playlistId);
    if (pl && !pl.trackIds.includes(trackId)) {
      pl.trackIds.push(trackId);
      this.save();
    }
  }

  handleLocalFiles(files) {
    const supportedTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/flac", "audio/m4a"];
    const addedTracks = [];

    Array.from(files).forEach((file, index) => {
      const fileNameClean = file.name.replace(/\.[^/.]+$/, "");
      const blobUrl = URL.createObjectURL(file);

      const localTrack = {
        id: "local-" + Date.now() + "-" + index,
        title: fileNameClean,
        artist: "Zin Local Audio",
        album: "Zin Vault Imports",
        duration: 180,
        cover: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop",
        audioSrc: blobUrl,
        youtubeId: "jfKfPfyJRdk",
        genre: "Zin Local Import",
        moods: ["All", "Energize", "Relax"],
        ambientGlow: "rgba(0, 242, 254, 0.4)",
        isLocal: true,
        lyrics: [
          { time: 0, text: `(⚡ Zin DSP Player - ${fileNameClean})` },
          { time: 5, text: "Zin Audio Engine Real-Time Frequency Processing Active" },
          { time: 15, text: "Enjoy your imported audio with live Zin visualizers & 5-Band Studio EQ!" }
        ]
      };

      this.localFiles.push(localTrack);
      addedTracks.push(localTrack);
    });

    if (addedTracks.length > 0) {
      this.renderSidebarPlaylists();
      if (window.zinUI) {
        window.zinUI.renderMainContent("local");
      }
      if (window.zinPlayer) {
        window.zinPlayer.loadTrack(addedTracks[0], true);
      }
    }
  }

  renderSidebarPlaylists() {
    const container = document.getElementById("sidebar-playlists-list");
    if (!container) return;

    if (this.userPlaylists.length === 0) {
      container.innerHTML = `<div style="font-size: 0.76rem; color: var(--text-muted); padding: 4px 10px;">No custom playlists yet</div>`;
      return;
    }

    container.innerHTML = this.userPlaylists.map(pl => `
      <div class="playlist-item ${this.activePlaylistId === pl.id ? 'active' : ''}" onclick="window.zinUI.openPlaylistView('${pl.id}')">
        <span class="truncate">${pl.title}</span>
        <span style="font-size: 0.68rem; color: var(--text-muted);">${pl.trackIds.length}</span>
      </div>
    `).join("");
  }
}
