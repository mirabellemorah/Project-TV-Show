// Creates a DOM element for a single show using the HTML template
function makePageForShow(show) {
  const template = document.querySelector("template"); // Using a same template for shows
  const showCard = template.content.cloneNode(true);

  showCard.querySelector(".episode-title").textContent = show.name;
  showCard.querySelector(".episode-summary").innerHTML = show.summary;
  const img = showCard.querySelector(".episode-image");
  img.src = show.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = show.name;

  return showCard;
}

// Renders a list of shows and updates the match count display
function renderShows(displayedShows, allShows) {
  const root = document.getElementById("root");
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });

  const showCards = displayedShows.map(makePageForShow);
  root.append(...showCards);

  document.getElementById(
    "epMatchCount"
  ).textContent = `${displayedShows.length} / ${allShows.length} show(s) found`;
}

// Creates a DOM element for a single episode using the HTML template
function makePageForEpisodes(episode) {
  const template = document.querySelector("template");
  const episodeCard = template.content.cloneNode(true);

  // Set episode title
  episodeCard.querySelector(".episode-title").textContent = episode.name;

  // Format episode code as SxxExx (zero-padded)
  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedEpisode = String(episode.number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

  // Set episode code and remove episode number line (not needed)
  episodeCard.querySelector(".episode-season").textContent = episodeCode;
  episodeCard.querySelector(".episode-number").remove();

  // Set episode summary (HTML allowed)
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

  // Set episode image, or a placeholder if missing
  const img = episodeCard.querySelector(".episode-image");
  img.src =
    episode.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = episode.name;

  return episodeCard;
}

// Shows a message (loading or error) in the main content area
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
function renderEpisodes(displayedEpisodes, allEpisodes) {
  const root = document.getElementById("root");
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });

  const episodeCards = displayedEpisodes.map(makePageForEpisodes);
  root.append(...episodeCards);

  document.getElementById(
    "epMatchCount"
  ).textContent = `${displayedEpisodes.length} / ${allEpisodes.length} episode(s) found`;
  // REMOVE THIS LINE:
  // populateEpisodeSelect(allEpisodes);
}

// Sets up search box to filter episodes by name or summary (case-insensitive)
function filterEpisodes(allEpisodes) {
  const searchInput = document.getElementById("search-bar");
  searchInput.addEventListener("input", () => {
    const inputValue = searchInput.value.toLowerCase();
    // Filter episodes by name or summary
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(inputValue) ||
        (ep.summary && ep.summary.toLowerCase().includes(inputValue))
    );
    // Render filtered episodes
    renderEpisodes(filtered, allEpisodes);
  });
}

// Populates the episode select dropdown with all episodes
function populateEpisodeSelect(allEpisodes) {
  const select = document.getElementById("episode-selector");
  select.innerHTML = "";

  // Add "All episodes" option at the top
  const allOption = document.createElement("option");
  allOption.value = "all-episodes";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

  // Add each episode as an option in the dropdown
  allEpisodes.forEach((ep) => {
    const paddedSeason = String(ep.season).padStart(2, "0");
    const paddedEpisode = String(ep.number).padStart(2, "0");
    const code = `S${paddedSeason}E${paddedEpisode}`;
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });

  // When dropdown changes, show either all episodes or just the selected one
  select.onchange = () => {
    const selectedValue = select.value;
    const searchInput = document.getElementById("search-bar");
    searchInput.value = "";

    if (selectedValue === "all-episodes") {
      // Show all episodes
      renderEpisodes(allEpisodes, allEpisodes);
    } else {
      // Show only the selected episode
      const filtered = allEpisodes.filter((ep) => {
        const paddedSeason = String(ep.season).padStart(2, "0");
        const paddedEpisode = String(ep.number).padStart(2, "0");
        const code = `S${paddedSeason}E${paddedEpisode}`;
        return code === selectedValue;
      });
      renderEpisodes(filtered, allEpisodes);
    }
  };
}

function populateShowSelect(allShows) {
  const selectElem = document.getElementById("show-selector");
  selectElem.innerHTML = "";

  // Add "All Shows" option at the top
  const allOption = document.createElement("option");
  allOption.value = "all-shows";
  allOption.textContent = "All shows";
  selectElem.appendChild(allOption);

  // Add each show as an option in the dropdown
  // Sort all shows in alphabetical order, case-insensitive
  allShows
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name.toLowerCase()))
    .forEach((show) => {
      const option = document.createElement("option");
      option.value = show.name; // Use show name as value
      option.textContent = show.name;
      selectElem.appendChild(option);
    });

  // When dropdown changes, show either all episodes or just the selected one
  selectElem.onchange = () => {
    const selectedValue = selectElem.value;
    const searchInput = document.getElementById("search-bar");
    searchInput.value = "";

    if (selectedValue === "all-shows") {
      // Show all episodes
      renderShows(allShows, allShows);
    } else {
      // Show only the selected show
      const selectedShow = allShows.find((show) => show.name === selectedValue);
      console.log("Selected show:", selectedShow);
      const showURL = selectedShow.url;
      const newURL = showURL.replace(/\/[^/]+$/, "/episodes");
      let url = new URL(newURL);
      url.hostname = "api.tvmaze.com";
      console.log("Selected show URL:", url);
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((showData) => {
          renderEpisodes(showData, showData);
          populateEpisodeSelect(showData);
          filterEpisodes(showData);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          showMessage("Failed to load TV show. Please try again later.", true);
        });
    }
  };
}

// Main setup function: fetches episode data, sets up UI and event listeners
function setup() {
  /*  showMessage("Loading episodes...");
  // Fetch episode data from TVMaze API (only once per visit)
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((allEpisodes) => {
      // Render all episodes and set up search/filter logic
      renderEpisodes(allEpisodes, allEpisodes);
      populateEpisodeSelect(allEpisodes); // Only call ONCE here
      filterEpisodes(allEpisodes);
    })
    .catch(() => {
      // Show an error message in the DOM if fetching fails
      showMessage("Failed to load episodes. Please try again later.", true);
    });*/
  showMessage("Loading TV Shows...");
  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((allShows) => {
      // Render all shows and set up search/filter logic
      renderShows(allShows, allShows);
      populateShowSelect(allShows);
    })
    .catch((err) => {
      // Show an error message in the DOM if fetching fails
      console.error("Fetch error:", err);
      showMessage("Failed to load TV shows. Please try again later.", true);
    });
}

// Run setup when the page loads
window.onload = setup;
