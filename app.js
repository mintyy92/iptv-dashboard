const m3uUrlInput = document.getElementById("m3uUrl");
const m3uInput = document.getElementById("m3uInput");
const loadBtn = document.getElementById("loadBtn");
const channelList = document.getElementById("channelList");
const search = document.getElementById("search");
const video = document.getElementById("video");
const nowPlaying = document.getElementById("nowPlaying");

let channels = [];
let hlsInstance = null;

function parseM3U(content) {
  const lines = content.split("\n").map((line) => line.trim());
  const parsed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("#EXTINF")) {
      const name = line.split(",").pop()?.trim() || "Unnamed Channel";
      const url = lines[i + 1]?.trim();

      if (url && !url.startsWith("#")) {
        parsed.push({ name, url });
      }
    }
  }

  return parsed;
}

function renderChannels(list) {
  channelList.innerHTML = "";

  if (!list.length) {
    channelList.innerHTML = "<p>No channels found.</p>";
    return;
  }

  list.forEach((channel) => {
    const btn = document.createElement("button");
    btn.className = "channel-btn";
    btn.textContent = channel.name;
    btn.onclick = () => playChannel(channel);
    channelList.appendChild(btn);
  });
}

function playChannel(channel) {
  nowPlaying.textContent = channel.name;

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (window.Hls && Hls.isSupported() && channel.url.includes(".m3u8")) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(channel.url);
    hlsInstance.attachMedia(video);
  } else {
    video.src = channel.url;
  }

  video.play().catch((err) => {
    console.error("Playback failed:", err);
  });
}

loadBtn.addEventListener("click", async () => {
  const url = m3uUrlInput.value.trim();
  const rawText = m3uInput.value.trim();

  if (url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const text = await response.text();
      channels = parseM3U(text);
      renderChannels(channels);
    } catch (error) {
      console.error("Failed to load M3U URL:", error);
      alert("Failed to load M3U URL. The provider may be blocking direct access.");
    }

    return;
  }

  if (rawText) {
    channels = parseM3U(rawText);
    renderChannels(channels);
    return;
  }

  alert("Please paste an M3U URL or M3U content first.");
});

search.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = channels.filter((channel) =>
    channel.name.toLowerCase().includes(term)
  );
  renderChannels(filtered);
});
