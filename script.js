function makePageForEpisodes(episode) {
  const template = document.querySelector("template");
  const episodeCard = template.content.cloneNode(true);

  episodeCard.querySelector(".episode-title").textContent = episode.name;

  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedEpisode = String(episode.number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

  episodeCard.querySelector(".episode-season").textContent = episodeCode;
  episodeCard.querySelector(".episode-number").remove();
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

  const img = episodeCard.querySelector(".episode-image");
  img.src =
    episode.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = episode.name;

  return episodeCard;
}

function showMessage(msg, isError = false) {
  const root = document.getElementById("root");
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });
  const messageElem = document.createElement("div");
  messageElem.textContent = msg;
  messageElem.style.padding = "2em";
  messageElem.style.textAlign = "center";
  messageElem.style.color = isError ? "red" : "#333";
  root.appendChild(messageElem);
  document.getElementById("epMatchCount").textContent = "";
}

function renderEpisodes(episodes) {
  const root = document.getElementById("root");
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });
  const episodeCards = episodes.map(makePageForEpisodes);
  root.append(...episodeCards);
  document.getElementById(
    "epMatchCount"
  ).textContent = `${episodes.length} / ${episodes.length} episode(s) found`;
  populateEpisodeSelect(episodes);
}

function filterEpisodes(allEpisodes) {
  const searchInput = document.getElementById("search-bar");
  searchInput.addEventListener("input", () => {
    const inputValue = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(inputValue) ||
        (ep.summary && ep.summary.toLowerCase().includes(inputValue))
    );
    renderEpisodes(filtered);
  });
}

function populateEpisodeSelect(episodes) {
  const select = document.getElementById("selector");
  select.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all-episodes";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

  episodes.forEach((ep, idx) => {
    const paddedSeason = String(ep.season).padStart(2, "0");
    const paddedEpisode = String(ep.number).padStart(2, "0");
    const code = `S${paddedSeason}E${paddedEpisode}`;
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });

  select.onchange = () => {
    const selectedValue = select.value;
    const searchInput = document.getElementById("search-bar");
    searchInput.value = "";
    if (selectedValue === "all-episodes") {
      renderEpisodes(episodes);
    } else {
      const filtered = episodes.filter((ep) => {
        const paddedSeason = String(ep.season).padStart(2, "0");
        const paddedEpisode = String(ep.number).padStart(2, "0");
        const code = `S${paddedSeason}E${paddedEpisode}`;
        return code === selectedValue;
      });
      renderEpisodes(filtered);
      // Reset dropdown to "All episodes" after showing one episode
      select.value = "all-episodes";
    }
  };
}

function setup() {
  showMessage("Loading episodes...");
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((allEpisodes) => {
      renderEpisodes(allEpisodes);
      filterEpisodes(allEpisodes);
    })
    .catch(() => {
      showMessage("Failed to load episodes. Please try again later.", true);
    });
}

window.onload = setup;
