// Creates a DOM element for a single episode using the HTML template
function makePageForEpisodes(episode) {
  const template = document.querySelector("template");
  const episodeCard = template.content.cloneNode(true);

  // Set the episode title
  episodeCard.querySelector(".episode-title").textContent = episode.name;

  // Format the episode code as SxxExx (zero-padded)
  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedEpisode = String(episode.number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

  // Set the episode code in the card and remove the episode number line
  episodeCard.querySelector(".episode-season").textContent = `${episodeCode}`;
  episodeCard.querySelector(".episode-number").remove();

  // Set the episode summary (HTML allowed)
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

  // Set the episode image, or a placeholder if missing
  const img = episodeCard.querySelector(".episode-image");
  img.src =
    episode.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = episode.name;

  return episodeCard;
}

// Shows a message (e.g. loading or error) in the main content area
function showMessage(msg, isError = false) {
  const root = document.getElementById("root");
  // Remove all children except the template
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });
  // Create and style the message element
  const messageElem = document.createElement("div");
  messageElem.textContent = msg;
  messageElem.style.padding = "2em";
  messageElem.style.textAlign = "center";
  messageElem.style.color = isError ? "red" : "#333";
  root.appendChild(messageElem);
  // Clear the match count display
  document.getElementById("match-count").textContent = "";
}

// Renders a list of episodes and updates the match count display
function renderEpisodes(episodes, totalCount) {
  const root = document.getElementById("root");
  // Remove all children except the template
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });
  // Create and append episode cards
  const episodeCards = episodes.map(makePageForEpisodes);
  root.append(...episodeCards);

  // Show how many episodes are displayed out of the total
  document.getElementById(
    "match-count"
  ).textContent = `Showing ${episodes.length}/${totalCount} episode(s)`;
}

// Populates the episode select dropdown with all episodes
function populateEpisodeSelect(episodes) {
  const select = document.getElementById("episode-select");
  select.length = 1; // Keep only the "Show all episodes" option
  episodes.forEach((ep, idx) => {
    const paddedSeason = String(ep.season).padStart(2, "0");
    const paddedEpisode = String(ep.number).padStart(2, "0");
    const code = `S${paddedSeason}E${paddedEpisode}`;
    const option = document.createElement("option");
    option.value = idx; // Use the episode's index as the value
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });
}

const showCache = {}; // Cache for episodes per show id
let allShows = []; // List of all shows
let currentEpisodes = []; // Episodes for the currently selected show
let currentShowId = null; // Currently selected show id

function populateShowSelect(shows) {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = ""; // Clear previous options
  // Sort shows alphabetically, case-insensitive
  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function fetchEpisodesForShow(showId) {
  // If already fetched, use cache
  if (showCache[showId]) {
    currentEpisodes = showCache[showId];
    renderEpisodes(currentEpisodes, currentEpisodes.length);
    populateEpisodeSelect(currentEpisodes);
    return Promise.resolve(currentEpisodes);
  }
  // Otherwise, fetch and cache
  showMessage("Loading episodes...");
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((episodes) => {
      showCache[showId] = episodes;
      currentEpisodes = episodes;
      renderEpisodes(currentEpisodes, currentEpisodes.length);
      populateEpisodeSelect(currentEpisodes);
      return episodes;
    })
    .catch(() => {
      showMessage("Failed to load episodes. Please try again later.", true);
      currentEpisodes = [];
      populateEpisodeSelect([]);
    });
}

// Main setup function: fetches data, sets up event listeners, and handles UI logic
function setup() {
  const showSelect = document.getElementById("show-select");
  const searchBox = document.getElementById("search-box");
  const episodeSelect = document.getElementById("episode-select");

  // Show loading message for shows
  showSelect.innerHTML = `<option value="">Loading shows...</option>`;
  showMessage("Loading shows...");

  // Fetch all shows (only once)
  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((shows) => {
      allShows = shows;
      populateShowSelect(allShows);
      // Select the first show by default
      if (allShows.length > 0) {
        currentShowId = allShows[0].id;
        showSelect.value = currentShowId;
        fetchEpisodesForShow(currentShowId);
      }
    })
    .catch(() => {
      showMessage("Failed to load shows. Please try again later.", true);
    });

  // When a show is selected, fetch and display its episodes
  showSelect.addEventListener("change", function () {
    currentShowId = showSelect.value;
    searchBox.value = "";
    episodeSelect.value = "all";
    if (currentShowId) {
      fetchEpisodesForShow(currentShowId);
    } else {
      showMessage("Please select a show.");
      populateEpisodeSelect([]);
    }
  });

  // Search box: filter episodes as the user types (case-insensitive)
  searchBox.addEventListener("input", function () {
    episodeSelect.value = "all"; // Reset episode select when searching
    const searchTerm = searchBox.value.trim().toLowerCase();
    if (searchTerm === "") {
      renderEpisodes(currentEpisodes, currentEpisodes.length);
    } else {
      const filtered = currentEpisodes.filter(
        (ep) =>
          ep.name.toLowerCase().includes(searchTerm) ||
          (ep.summary && ep.summary.toLowerCase().includes(searchTerm))
      );
      renderEpisodes(filtered, currentEpisodes.length);
    }
  });

  // Episode select: show only the selected episode, or all if "all" is chosen
  episodeSelect.addEventListener("change", function () {
    searchBox.value = ""; // Reset search when selecting
    if (episodeSelect.value === "all") {
      renderEpisodes(currentEpisodes, currentEpisodes.length);
    } else {
      const idx = Number(episodeSelect.value);
      renderEpisodes([currentEpisodes[idx]], currentEpisodes.length);
    }
  });
}

// Run setup when the page loads
window.onload = setup;
