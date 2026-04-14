const m3uInput = document.getElementById("m3uInput");
const loadBtn = document.getElementById("loadBtn");
const channelList = document.getElementById("channelList");
const search = document.getElementById("search");
const video = document.getElementById("video");
const nowPlaying = document.getElementById("nowPlaying");

let channels = [];
let hlsInstance = null;

function parseM3U(content) {
  const lines = content.split("\n").map(line => line.trim());
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

  list.forEach(channel => {
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

  video.play().catch(() => {});
}

loadBtn.addEventListener("click", () => {
  channels = parseM3U(m3uInput.value);
  renderChannels(channels);
});

search.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = channels.filter(c => c.name.toLowerCase().includes(term));
  renderChannels(filtered);
});