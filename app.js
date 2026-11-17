const songs = [
  {
    id: "love-in-the-sky",
    title: "Love In The Sky",
    artist: "The Weeknd",
    file: "the_weeknd_-_love_in_the_sky_(mp3.pm).mp3",
    cover: "sunset",
  },
  {
    id: "cry-for-me",
    title: "Cry For Me 2025",
    artist: "The Weeknd",
    file: "The_Weeknd_-_Cry_For_Me_2025_(mp3.pm).mp3",
    cover: "half",
  },
  {
    id: "riot",
    title: "RIOT",
    artist: "XXXTENTACION",
    file: "XXXTENTACION_-_RIOT_(mp3.pm).mp3",
    cover: "rings",
  },
  {
    id: "look-at-me",
    title: "Look At Me",
    artist: "XXXTENTACION",
    file: "XXXtentacion_-_Look_At_Me_(mp3.pm).mp3",
    cover: "corner",
  },
  {
    id: "ps-qs",
    title: "P's & Q's",
    artist: "Lil Uzi Vert",
    file: "Lil_Uzi_Vert_-_P_s_Q_s_Prod_By._Don_Cannon_(mp3.pm).mp3",
    cover: "block",
  },
  {
    id: "cannon",
    title: "Cannon (feat. Playboi Carti)",
    artist: "Lil Uzi Vert",
    file: "Lil_Uzi_Vert_-_Cannon_Feat._Playboi_Carti_(mp3.pm).mp3",
    cover: "line",
  },
];

const storageKey = "sismul-saved-v1";
const elements = {
  audio: document.getElementById("audio-player"),
  emptyDescription: document.getElementById("empty-description"),
  emptyState: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  playerStatus: document.getElementById("player-status"),
  playerTitle: document.getElementById("player-title"),
  resetFilters: document.getElementById("reset-filters"),
  resultStatus: document.getElementById("result-status"),
  savedToggle: document.getElementById("saved-toggle"),
  songList: document.getElementById("song-list"),
  songSearch: document.getElementById("song-search"),
  storageNotice: document.getElementById("storage-notice"),
  themeToggle: document.getElementById("theme-toggle"),
};

let savedOnly = false;
let savedIds = new Set();
let activeSongId = null;
let storageAvailable = true;

function showStorageNotice(message) {
  elements.storageNotice.textContent = message;
  elements.storageNotice.hidden = false;
}

function loadSavedSongs() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored) || stored.some((id) => typeof id !== "string")) {
      throw new TypeError("Format simpanan Sismul tidak valid.");
    }

    const knownIds = new Set(songs.map((song) => song.id));
    return new Set(stored.filter((id) => knownIds.has(id)));
  } catch (error) {
    storageAvailable = false;
    console.error("Simpanan Sismul tidak dapat dibaca.", error);
    showStorageNotice("Simpanan browser tidak tersedia. Perubahan hanya berlaku selama halaman ini terbuka.");
    return new Set();
  }
}

function persistSavedSongs() {
  if (!storageAvailable) return;

  try {
    localStorage.setItem(storageKey, JSON.stringify([...savedIds]));
  } catch (error) {
    storageAvailable = false;
    console.error("Simpanan Sismul tidak dapat diperbarui.", error);
    showStorageNotice("Simpanan browser tidak dapat diperbarui. Perubahan hanya berlaku selama halaman ini terbuka.");
  }
}

function getVisibleSongs() {
  const query = elements.songSearch.value.trim().toLocaleLowerCase("id");

  return songs.filter((song) => {
    const matchesQuery =
      !query ||
      song.title.toLocaleLowerCase("id").includes(query) ||
      song.artist.toLocaleLowerCase("id").includes(query);

    return matchesQuery && (!savedOnly || savedIds.has(song.id));
  });
}

function updateSavedToggle() {
  elements.savedToggle.textContent = savedOnly ? "Semua lagu" : "Simpanan";
  elements.savedToggle.setAttribute("aria-pressed", String(savedOnly));
  elements.savedToggle.setAttribute(
    "aria-label",
    savedOnly ? "Tampilkan semua lagu" : "Tampilkan lagu tersimpan",
  );
}

function updatePlayerSelection() {
  for (const button of elements.songList.querySelectorAll("[data-action='play']")) {
    const song = songs.find((item) => item.id === button.dataset.songId);
    const isPlaying = button.dataset.songId === activeSongId && !elements.audio.paused;
    button.textContent = isPlaying ? "Jeda" : "Putar";
    if (song) button.setAttribute("aria-label", `${isPlaying ? "Jeda" : "Putar"} ${song.title}`);
  }
}

function renderSongs() {
  const visibleSongs = getVisibleSongs();
  elements.songList.replaceChildren();

  for (const song of visibleSongs) {
    const isSaved = savedIds.has(song.id);
    const row = document.createElement("article");
    row.className = "song-row";

    const playCell = document.createElement("div");
    playCell.className = "song-play";
    const playButton = document.createElement("button");
    playButton.className = "play-button";
    playButton.type = "button";
    playButton.dataset.action = "play";
    playButton.dataset.songId = song.id;
    playButton.setAttribute("aria-label", `Putar ${song.title}`);
    playCell.append(playButton);

    const cover = document.createElement("div");
    cover.className = `song-cover cover--${song.cover}`;
    cover.setAttribute("aria-hidden", "true");

    const copy = document.createElement("div");
    copy.className = "song-copy";
    const artist = document.createElement("p");
    artist.className = "song-meta";
    artist.textContent = song.artist;
    const title = document.createElement("h3");
    title.textContent = song.title;
    copy.append(artist, title);

    const actions = document.createElement("div");
    actions.className = "song-actions";
    const saveButton = document.createElement("button");
    saveButton.className = "text-button";
    saveButton.type = "button";
    saveButton.dataset.action = "save";
    saveButton.dataset.songId = song.id;
    saveButton.textContent = isSaved ? "Tersimpan" : "Simpan";
    saveButton.setAttribute("aria-pressed", String(isSaved));
    saveButton.setAttribute(
      "aria-label",
      `${isSaved ? "Hapus" : "Simpan"} ${song.title} ${isSaved ? "dari" : "ke"} simpanan`,
    );
    actions.append(saveButton);

    row.append(playCell, cover, copy, actions);
    elements.songList.append(row);
  }

  elements.songList.hidden = visibleSongs.length === 0;
  elements.emptyState.hidden = visibleSongs.length !== 0;
  elements.songList.setAttribute("aria-busy", "false");

  if (savedOnly && visibleSongs.length === 0) {
    elements.emptyTitle.textContent = "Belum ada lagu tersimpan.";
    elements.emptyDescription.textContent = "Simpan lagu untuk menemukannya lagi di sini.";
  } else {
    elements.emptyTitle.textContent = "Lagu tidak ditemukan.";
    elements.emptyDescription.textContent = "Periksa ejaan atau coba judul dan artis lain.";
  }

  elements.resultStatus.textContent = savedOnly
    ? `${visibleSongs.length} lagu tersimpan.`
    : `${visibleSongs.length} file MP3.`;
  updateSavedToggle();
  updatePlayerSelection();
}

function toggleSavedSong(songId) {
  if (savedIds.has(songId)) {
    savedIds.delete(songId);
  } else {
    savedIds.add(songId);
  }

  persistSavedSongs();
  renderSongs();
}

async function playSong(song) {
  if (activeSongId === song.id && !elements.audio.paused) {
    elements.audio.pause();
    return;
  }

  if (activeSongId !== song.id) {
    activeSongId = song.id;
    elements.audio.controls = true;
    elements.playerTitle.textContent = `${song.title} / ${song.artist}`;
    elements.playerStatus.textContent = "Memuat file audio...";
    elements.audio.src = new URL(`./source/${encodeURIComponent(song.file)}`, document.baseURI).href;
  }

  renderSongs();

  try {
    await elements.audio.play();
  } catch (error) {
    console.error(`File audio "${song.file}" tidak dapat diputar.`, error);
    elements.playerStatus.textContent =
      "Pemutaran gagal. Pastikan file tersedia dan coba tekan Putar pada pemutar.";
  }
}

elements.songList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const song = songs.find((item) => item.id === button.dataset.songId);
  if (!song) return;

  if (button.dataset.action === "save") {
    toggleSavedSong(song.id);
  } else if (button.dataset.action === "play") {
    void playSong(song);
  }
});

elements.songSearch.addEventListener("input", renderSongs);
elements.savedToggle.addEventListener("click", () => {
  savedOnly = !savedOnly;
  renderSongs();
});
elements.resetFilters.addEventListener("click", () => {
  savedOnly = false;
  elements.songSearch.value = "";
  renderSongs();
});
elements.themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  elements.themeToggle.textContent = isDark ? "Mode terang" : "Mode gelap";
  elements.themeToggle.setAttribute("aria-pressed", String(isDark));
  elements.themeToggle.setAttribute(
    "aria-label",
    isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap",
  );
});

elements.audio.addEventListener("play", () => {
  elements.playerStatus.textContent = "Sedang diputar dari file lokal.";
  updatePlayerSelection();
});
elements.audio.addEventListener("pause", () => {
  if (activeSongId) elements.playerStatus.textContent = "Pemutaran dijeda.";
  updatePlayerSelection();
});
elements.audio.addEventListener("ended", () => {
  elements.playerStatus.textContent = "Lagu selesai diputar.";
  updatePlayerSelection();
});
elements.audio.addEventListener("error", () => {
  elements.playerStatus.textContent =
    "File audio tidak dapat dibuka. Pastikan file masih ada di folder source.";
  updatePlayerSelection();
});
elements.audio.addEventListener("waiting", () => {
  elements.playerStatus.textContent = "Menunggu data audio...";
});

savedIds = loadSavedSongs();
renderSongs();
