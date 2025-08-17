// Global variables for caching and state management
const showCache = {}; // { showId: [episodes] }
let allShows = [];
let currentEpisodes = [];
let currentShowId = null;

// Creates a DOM element for a single show card
function createShowCard(show) {
  const card = document.createElement("div");
  card.className = "show-card";

  // Show image
  const img = document.createElement("img");
  img.src = show.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = show.name;
  card.appendChild(img);

  // Show details
  const details = document.createElement("div");
  details.className = "show-details";

  // Handle genres - some shows might not have genres
  const genresText =
    show.genres && show.genres.length > 0 ? show.genres.join(", ") : "N/A";

  // Handle rating - some shows might not have rating
  const ratingText =
    show.rating && show.rating.average ? show.rating.average : "N/A";

  // Handle runtime - some shows might not have runtime
  const runtimeText = show.runtime ? `${show.runtime} min` : "N/A";

  // Handle status - some shows might not have status
  const statusText = show.status || "N/A";

  // Handle summary - remove HTML tags for cleaner display
  const summaryText = show.summary
    ? show.summary.replace(/<[^>]*>/g, "")
    : "No summary available";

  details.innerHTML = `
    <h2 class="show-title">${show.name}</h2>
    <div><strong>Genres:</strong> ${genresText}</div>
    <div><strong>Status:</strong> ${statusText}</div>
    <div><strong>Rating:</strong> ${ratingText}</div>
    <div><strong>Runtime:</strong> ${runtimeText}</div>
    <div class="show-summary">${summaryText}</div>
  `;
  card.appendChild(details);

  // Click to view episodes
  card.onclick = () => {
    showEpisodesForShow(show.id);
  };

  return card;
}

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

  // Add click handler to the episode card
  const cardElement = episodeCard.querySelector(".episode-card");
  cardElement.style.cursor = "pointer";
  cardElement.onclick = () => {
    // Clear the root container first
    const root = document.getElementById("root");
    Array.from(root.children).forEach((child) => {
      if (child.tagName !== "TEMPLATE") root.removeChild(child);
    });

    renderSingleEpisode(episode);
    document.getElementById("back-to-episodes").style.display = "inline";
    document.getElementById(
      "epMatchCount"
    ).textContent = `Showing 1/${currentEpisodes.length} episode(s)`;
  };

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
  document.getElementById("epMatchCount").textContent = "";
}

// Renders a list of episodes and updates the match count display
function renderEpisodes(episodes, totalCount) {
  const root = document.getElementById("root");
  // Remove all children except the template
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });

  // Check if we're showing a single episode
  if (episodes.length === 1) {
    renderSingleEpisode(episodes[0]);
    document.getElementById("back-to-episodes").style.display = "inline";
  } else {
    // Create and append episode cards
    const episodeCards = episodes.map(makePageForEpisodes);
    root.append(...episodeCards);
    document.getElementById("back-to-episodes").style.display = "none";
  }

  // Show how many episodes are displayed out of the total
  document.getElementById(
    "epMatchCount"
  ).textContent = `Showing ${episodes.length}/${totalCount} episode(s)`;
}

// Render a single episode in a centered, larger format
function renderSingleEpisode(episode) {
  const root = document.getElementById("root");

  const singleEpisodeView = document.createElement("div");
  singleEpisodeView.className = "single-episode-view";

  const singleEpisodeCard = document.createElement("div");
  singleEpisodeCard.className = "single-episode-card";

  // Episode image
  const img = document.createElement("img");
  img.className = "single-episode-image";
  img.src =
    episode.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = episode.name;

  // Episode details
  const details = document.createElement("div");
  details.className = "single-episode-details";

  // Format episode code
  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedEpisode = String(episode.number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

  details.innerHTML = `
    <h2 class="single-episode-title">${episode.name}</h2>
    <div class="single-episode-code">${episodeCode}</div>
    <div class="single-episode-summary">${episode.summary || ""}</div>
  `;

  singleEpisodeCard.appendChild(img);
  singleEpisodeCard.appendChild(details);
  singleEpisodeView.appendChild(singleEpisodeCard);
  root.appendChild(singleEpisodeView);
}

// Populates the episode select dropdown with all episodes
function populateEpisodeSelect(episodes) {
  const select = document.getElementById("episode-selector");
  select.innerHTML = ""; // Clear all options

  // Add "All episodes" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

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

// Render the shows listing (front page)
function renderShowsListing(shows) {
  const showsDiv = document.getElementById("shows-listing");
  showsDiv.innerHTML = ""; // Clear previous

  // Create search container
  const searchContainer = document.createElement("div");
  searchContainer.id = "shows-search-container";

  // Create and add label for search box
  const searchBoxLabel = document.createElement("label");
  searchBoxLabel.setAttribute("for", "show-search-box");
  searchBoxLabel.className = "visually-hidden";
  searchBoxLabel.textContent = "Search Shows";

  // Create search box
  const searchBox = document.createElement("input");
  searchBox.id = "show-search-box";
  searchBox.placeholder = "Search shows...";

  // Create and add label for show selector
  const showSelectorLabel = document.createElement("label");
  showSelectorLabel.setAttribute("for", "show-selector");
  showSelectorLabel.className = "visually-hidden";
  showSelectorLabel.textContent = "Select a Show";

  // Create show selector
  const showSelector = document.createElement("select");
  showSelector.id = "show-selector";

  // Add "All shows" option
  const allOption = document.createElement("option");
  allOption.value = "all-shows";
  allOption.textContent = "All shows";
  showSelector.appendChild(allOption);

  // Add each show as an option
  allShows
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelector.appendChild(option);
    });

  // Create show count display
  const showCount = document.createElement("span");
  showCount.id = "showMatchCount";
  showCount.textContent = `Showing ${shows.length}/${allShows.length} show(s)`;

  // Add elements to search container WITH labels
  searchContainer.appendChild(searchBoxLabel);
  searchContainer.appendChild(searchBox);
  searchContainer.appendChild(showSelectorLabel);
  searchContainer.appendChild(showSelector);
  searchContainer.appendChild(showCount);

  // Create shows grid
  const showsGrid = document.createElement("div");
  showsGrid.className = "shows-grid";

  // Add search container and grid to shows listing
  showsDiv.appendChild(searchContainer);
  showsDiv.appendChild(showsGrid);

  // Show the shows listing
  showsDiv.style.display = "flex";
  document.getElementById("episodes-view").style.display = "none";
  document.getElementById("nav-bar").style.display = "none";

  // Filter shows as user types
  searchBox.oninput = function () {
    const term = searchBox.value.trim().toLowerCase();
    const filtered = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(term) ||
        (show.genres && show.genres.join(" ").toLowerCase().includes(term)) ||
        (show.summary && show.summary.toLowerCase().includes(term))
    );
    renderShowsInGrid(filtered);
    showCount.textContent = `Showing ${filtered.length}/${allShows.length} show(s)`;
  };

  // Show selector functionality
  showSelector.onchange = function () {
    const selectedValue = showSelector.value;
    searchBox.value = ""; // Reset search when selecting

    if (selectedValue === "all-shows") {
      renderShowsInGrid(allShows);
      showCount.textContent = `Showing ${allShows.length}/${allShows.length} show(s)`;
    } else {
      const selectedShow = allShows.find((show) => show.id == selectedValue);
      if (selectedShow) {
        renderShowsInGrid([selectedShow]);
        showCount.textContent = `Showing 1/${allShows.length} show(s)`;
      }
    }
  };

  // Render shows in the grid
  renderShowsInGrid(shows);
}

// Render shows in the grid container
function renderShowsInGrid(shows) {
  const showsGrid = document.querySelector(".shows-grid");
  if (!showsGrid) return;

  showsGrid.innerHTML = ""; // Clear previous

  shows.forEach((show) => {
    const card = createShowCard(show);
    showsGrid.appendChild(card);
  });
}

// Show episodes for a selected show
function showEpisodesForShow(showId) {
  document.getElementById("shows-listing").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";
  document.getElementById("nav-bar").style.display = "block";
  document.getElementById("back-to-episodes").style.display = "none";
  currentShowId = showId;
  fetchEpisodesForShow(showId);
}

// Navigation: back to shows listing
document.getElementById("back-to-shows").onclick = function (e) {
  e.preventDefault();
  // Re-render the shows listing to restore the search bar and all functionality
  renderShowsListing(allShows);
};

// Navigation: back to episodes listing
document.getElementById("back-to-episodes").onclick = function (e) {
  e.preventDefault();
  // Show all episodes for the current show
  renderEpisodes(currentEpisodes, currentEpisodes.length);
  document.getElementById("back-to-episodes").style.display = "none";
  document.getElementById("episode-selector").value = "all";
};

// Fetch and cache all shows (once)
function fetchAllShows() {
  return fetch("https://api.tvmaze.com/shows")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch shows");
      return res.json();
    })
    .then((shows) => {
      allShows = shows;
      renderShowsListing(allShows);
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      showMessage("Failed to load shows. Please try again later.", true);
    });
}

// Fetch and cache episodes for a show (once per show)
function fetchEpisodesForShow(showId) {
  if (showCache[showId]) {
    currentEpisodes = showCache[showId];
    renderEpisodes(currentEpisodes, currentEpisodes.length);
    populateEpisodeSelect(currentEpisodes);
    return;
  }
  showMessage("Loading episodes...");
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch episodes");
      return res.json();
    })
    .then((episodes) => {
      showCache[showId] = episodes;
      currentEpisodes = episodes;
      renderEpisodes(currentEpisodes, currentEpisodes.length);
      populateEpisodeSelect(currentEpisodes);
    })
    .catch(() => {
      showMessage("Failed to load episodes. Please try again later.", true);
    });
}

// Main setup function: fetches data, sets up event listeners, and handles UI logic
function setup() {
  fetchAllShows();

  // Search box: filter episodes as the user types (case-insensitive)
  const searchBox = document.getElementById("search-bar");
  searchBox.addEventListener("input", function () {
    const episodeSelect = document.getElementById("episode-selector");
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
  const episodeSelect = document.getElementById("episode-selector");
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
