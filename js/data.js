/**
 * Zin Music - Romantic Gift Edition
 * Powered 100% by the 8 master songs in ./zin-list/
 */

const CURATED_TRACKS = [
  {
    id: "zin-track-hakbang",
    title: "Hakbang",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 185,
    cover: "thumbnails/zin-track-hakbang.jpg",
    audioSrc: "zin-list/Zin-Hakbang.mp4",
    videoSrc: "zin-list/Zin-Hakbang.mp4",
    genre: "OPM / Indie Pop",
    moods: ["Sweet & Upbeat", "Our Favorites"],
    ambientGlow: "rgba(255, 51, 102, 0.45)",
    lyrics: [
      { time: 0, text: "(💖 Zin Music - Hakbang • Made For You)" },
      { time: 10, text: "Bawat hakbang ko ay patungo sa'yo" },
      { time: 22, text: "Sabay sa ritmo ng ating mga puso" },
      { time: 35, text: "Ikaw ang liwanag sa aking mundo" },
      { time: 50, text: "Hawak-kamay sa bawat pagsubok" },
      { time: 75, text: "Walang makakapigil sa pagmamahal ko" },
      { time: 105, text: "Hakbang pasulong, ikaw lang at ako" },
      { time: 135, text: "Forever with you • My favorite person ✨" }
    ]
  },
  {
    id: "zin-track-kung",
    title: "Kung",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 210,
    cover: "thumbnails/zin-track-kung.jpg",
    audioSrc: "zin-list/Zin-Kung.mp4",
    videoSrc: "zin-list/Zin-Kung.mp4",
    genre: "OPM / Acoustic Soul",
    moods: ["Late Night Acoustic", "Our Favorites"],
    ambientGlow: "rgba(255, 158, 0, 0.4)",
    lyrics: [
      { time: 0, text: "(🎸 Zin Music - Kung • Dedication)" },
      { time: 12, text: "Kung panaginip man ito, 'wag nang gisingin" },
      { time: 25, text: "Ang tanging himig na nais kong dinggin" },
      { time: 42, text: "Payapang gabi sa tabi ng aking mahal" },
      { time: 65, text: "Bawat ngiti mo ay aking dasal" },
      { time: 95, text: "Kung tayo ay magkasama magpakailanman" },
      { time: 130, text: "Ikaw ang aking tahanan at kaligayahan" }
    ]
  },
  {
    id: "zin-track-kung-pt2",
    title: "Kung (Pt. 2)",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 195,
    cover: "thumbnails/zin-track-kung-pt2.jpg",
    audioSrc: "zin-list/Zin-Kung.pt2.mp4",
    videoSrc: "zin-list/Zin-Kung.pt2.mp4",
    genre: "OPM / Ballad & Lo-Fi",
    moods: ["Late Night Acoustic", "Sweet & Upbeat"],
    ambientGlow: "rgba(0, 198, 255, 0.4)",
    lyrics: [
      { time: 0, text: "(☕ Zin Music - Kung Pt. 2 • Pure Love)" },
      { time: 14, text: "Mas malalim na pagmamahal sa bawat araw" },
      { time: 30, text: "Sa bawat paggising, ikaw ang natatanaw" },
      { time: 50, text: "Tahimik na pag-ibig, wagas at totoo" },
      { time: 75, text: "Laging nandito para sa'yo" },
      { time: 110, text: "Ikalawang yugto ng ating magandang kwento" }
    ]
  },
  {
    id: "zin-track-mahika",
    title: "Mahika",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 175,
    cover: "thumbnails/zin-track-mahika.jpg",
    audioSrc: "zin-list/Zin-Mahika.mp4",
    videoSrc: "zin-list/Zin-Mahika.mp4",
    genre: "OPM / Romantic Pop",
    moods: ["Sweet & Upbeat", "Our Favorites"],
    ambientGlow: "rgba(255, 0, 85, 0.45)",
    lyrics: [
      { time: 0, text: "(✨ Zin Music - Mahika • Pure Magic)" },
      { time: 12, text: "May mahika sa bawat pagtitig mo" },
      { time: 26, text: "Bumibilis ang tibok ng puso ko" },
      { time: 42, text: "Sumayaw sa ilalim ng mga tala" },
      { time: 65, text: "Ang buong mundo ko ay ikaw at ikaw" },
      { time: 95, text: "Tunay na mahika ang pag-ibig mo" },
      { time: 125, text: "Salamat sa bawat saya at pagmamahal 💖" }
    ]
  },
  {
    id: "zin-track-slow-dance",
    title: "Slow Dance",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 180,
    cover: "thumbnails/zin-track-slow-dance.jpg",
    audioSrc: "zin-list/Zin-Slow Dance.mp4",
    videoSrc: "zin-list/Zin-Slow Dance.mp4",
    genre: "R&B / Romantic Soul",
    moods: ["Late Night Acoustic", "Our Favorites"],
    ambientGlow: "rgba(255, 110, 199, 0.4)",
    lyrics: [
      { time: 0, text: "(💖 Zin Music - Slow Dance • Our Special Moment)" },
      { time: 15, text: "Take my hand in the soft dim light" },
      { time: 30, text: "You are the sweetest part of my life" },
      { time: 55, text: "Slow dancing in our own quiet paradise" },
      { time: 85, text: "Forever in your arms, safe and sound" },
      { time: 120, text: "Just you and me in this beautiful song" }
    ]
  },
  {
    id: "zin-track-starry-night",
    title: "Starry Night",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 215,
    cover: "thumbnails/zin-track-starry-night.jpg",
    audioSrc: "zin-list/Zin-Starry Night.mp4",
    videoSrc: "zin-list/Zin-Starry Night.mp4",
    genre: "Synthwave / Dream Pop",
    moods: ["Starry Dreams", "Sweet & Upbeat"],
    ambientGlow: "rgba(0, 242, 254, 0.45)",
    lyrics: [
      { time: 0, text: "(🌌 Zin Music - Starry Night • Under the Stars)" },
      { time: 18, text: "Underneath a sky full of shining stars" },
      { time: 35, text: "You shine brighter than all of them" },
      { time: 60, text: "Lost in the sweet memories we create" },
      { time: 90, text: "My heart belongs to you, always" },
      { time: 130, text: "A magical starry night with my love ✨" }
    ]
  },
  {
    id: "zin-track-tinatangi",
    title: "Tinatangi",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 205,
    cover: "thumbnails/zin-track-tinatangi.jpg",
    audioSrc: "zin-list/Zin-Tinatangi.mp4",
    videoSrc: "zin-list/Zin-Tinatangi.mp4",
    genre: "OPM / Soulful Acoustic",
    moods: ["Late Night Acoustic", "Our Favorites"],
    ambientGlow: "rgba(157, 78, 221, 0.45)",
    lyrics: [
      { time: 0, text: "(🌸 Zin Music - Tinatangi • My Only One)" },
      { time: 15, text: "Ikaw ang aking nag-iisang tinatangi" },
      { time: 32, text: "Sa bawat umaga at bawat gabi" },
      { time: 55, text: "Walang kapantay ang iyong ganda at kabaitan" },
      { time: 85, text: "Dito sa aking puso, ikaw ay iingatan" },
      { time: 120, text: "Mahal na mahal kita, ngayon at kailanman 💖" }
    ]
  },
  {
    id: "zin-track-with-u",
    title: "With U",
    artist: "Zin Music",
    album: "Our Playlist 💕",
    duration: 170,
    cover: "thumbnails/zin-track-with-u.jpg",
    audioSrc: "zin-list/Zin-With U.mp4",
    videoSrc: "zin-list/Zin-With U.mp4",
    genre: "Pop / Upbeat Love",
    moods: ["Sweet & Upbeat", "Our Favorites"],
    ambientGlow: "rgba(255, 0, 51, 0.45)",
    lyrics: [
      { time: 0, text: "(🔥 Zin Music - With U • Always Together)" },
      { time: 12, text: "Every single moment is better with you" },
      { time: 26, text: "You make all my dreams come true" },
      { time: 45, text: "Laughing and dancing together" },
      { time: 70, text: "Holding you close forever" },
      { time: 100, text: "I'm so lucky to be With U! 💖" }
    ]
  }
];

const DEFAULT_PLAYLISTS = [
  {
    id: "zin-pl-all",
    title: "Our Complete Love Playlist 💕",
    subtitle: "8 songs handpicked just for you",
    cover: "thumbnails/zin-track-hakbang.jpg",
    trackIds: ["zin-track-hakbang", "zin-track-kung", "zin-track-kung-pt2", "zin-track-mahika", "zin-track-slow-dance", "zin-track-starry-night", "zin-track-tinatangi", "zin-track-with-u"]
  }
];

const MOOD_FILTERS = [
  { id: "all", label: "💕 All Our Songs", icon: "sparkles" },
  { id: "Our Favorites", label: "💖 Our Favorites", icon: "heart" },
  { id: "Sweet & Upbeat", label: "✨ Sweet & Upbeat", icon: "zap" },
  { id: "Late Night Acoustic", label: "🌙 Late Night Acoustic", icon: "coffee" },
  { id: "Starry Dreams", label: "🌌 Starry Dreams", icon: "music" }
];

const MEMORY_CLIPS = [
  {
    id: "clip-1",
    title: "Memory Clip 01 • Sweet Smiles",
    subtitle: "Cherished moments and gentle laughter",
    videoSrc: "zin-clip/Clip1.mp4",
    cover: "thumbnails/clip-1.jpg",
    note: "Every smile shared with you is a memory I keep close to my heart."
  },
  {
    id: "clip-2",
    title: "Memory Clip 02 • Beautiful Days",
    subtitle: "Unforgettable moments walking side by side",
    videoSrc: "zin-clip/Clip2.mp4",
    cover: "thumbnails/clip-2.jpg",
    note: "The happiest moments are the simplest ones spent together."
  },
  {
    id: "clip-3",
    title: "Memory Clip 03 • Forever & Always",
    subtitle: "Our journey together filled with love and joy",
    videoSrc: "zin-clip/Clip3.mp4",
    cover: "thumbnails/clip-3.jpg",
    note: "Looking forward to creating a thousand more beautiful memories with you."
  }
];
