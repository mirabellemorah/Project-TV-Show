// please ignore whichever section is commented out. It is another method to get the same results and I am leaving it here for my learning purposes

// //You can edit ALL of the code here
// function setup() {
//   const allEpisodes = getAllEpisodes();
//   makePageForEpisodes(allEpisodes);
// }

// function makePageForEpisodes(episodeList) {
//   const rootElem = document.getElementById("root");

//   for (let i = 0; i < episodeList.length; i++) {
//     const episode = episodeList[i];

//     const template = document.querySelector("template").content.cloneNode(true);

//     // Set the image
//     const imageElem = template.querySelector(".episode-image");
//     imageElem.src = episode.image.medium;
//     imageElem.alt = episode.name;

//     // Set the title
//     const titleElem = template.querySelector(".episode-title");
//     titleElem.textContent = episode.name;

//     // Format episode code like S02E07
//     const episodeCode =
//       "S" +
//       String(episode.season).padStart(2, "0") +
//       "E" +
//       String(episode.number).padStart(2, "0");

//     // Set the combined episode code somewhere
//     // Show it in class "episode-season"
//     const codeElem = template.querySelector(".episode-season");
//     codeElem.textContent = episodeCode;

//     // Set the summary
//     const summaryElem = template.querySelector(".episode-summary");
//     summaryElem.innerHTML = episode.summary;

//     // Append it to the DOM
//     rootElem.appendChild(template);
//   }
// }

// window.onload = setup;

//###########################//METHOD 2 ###########################//

function makePageForEpisodes(episode) {
  const template = document.querySelector("template");
  const episodeCard = template.content.cloneNode(true);

  //the below code is to set the episode name

  episodeCard.querySelector(".episode-title").textContent = episode.name;

  //the below code is to set the episode code like S02E07

  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedEpisode = String(episode.number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

  //the below code is to set the episode code in the class "episode-season"
  //and remove the episode number line since it's not going to be used

  episodeCard.querySelector(".episode-season").textContent = `${episodeCode}`;
  episodeCard.querySelector(".episode-number").remove(); // remove extra line since it's not going to be used

  //the below code is to set the episode summary
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

  //the below code is to set the episode image
  //if no image is available, it will use a placeholder image
  const img = episodeCard.querySelector(".episode-image");
  img.src =
    episode.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = episode.name;

  return episodeCard;
}

// Helper to render a list of episodes and update match count
function renderEpisodes(episodes, totalCount) {
  const root = document.getElementById("root");
  // Remove all children except the template
  Array.from(root.children).forEach((child) => {
    if (child.tagName !== "TEMPLATE") root.removeChild(child);
  });
  const episodeCards = episodes.map(makePageForEpisodes);
  root.append(...episodeCards);

  // Update match count in the format "Showing 10/73 episodes"
  document.getElementById(
    "match-count"
  ).textContent = `Showing ${episodes.length}/${totalCount} episode(s)`;
}

function populateEpisodeSelect(episodes) {
  const select = document.getElementById("episode-select");
  // Remove all except the first option
  select.length = 1;
  episodes.forEach((ep, idx) => {
    const paddedSeason = String(ep.season).padStart(2, "0");
    const paddedEpisode = String(ep.number).padStart(2, "0");
    const code = `S${paddedSeason}E${paddedEpisode}`;
    const option = document.createElement("option");
    option.value = idx; // index in the episodes array
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });
}

function setup() {
  const allEpisodes = getAllEpisodes();
  renderEpisodes(allEpisodes, allEpisodes.length);
  populateEpisodeSelect(allEpisodes);

  const searchBox = document.getElementById("search-box");
  const episodeSelect = document.getElementById("episode-select");

  searchBox.addEventListener("input", function () {
    episodeSelect.value = "all"; // Reset select when searching
    const searchTerm = searchBox.value.trim().toLowerCase();
    if (searchTerm === "") {
      renderEpisodes(allEpisodes, allEpisodes.length);
    } else {
      const filtered = allEpisodes.filter(
        (ep) =>
          ep.name.toLowerCase().includes(searchTerm) ||
          (ep.summary && ep.summary.toLowerCase().includes(searchTerm))
      );
      renderEpisodes(filtered, allEpisodes.length);
    }
  });

  episodeSelect.addEventListener("change", function () {
    searchBox.value = ""; // Reset search when selecting
    if (episodeSelect.value === "all") {
      renderEpisodes(allEpisodes, allEpisodes.length);
    } else {
      const idx = Number(episodeSelect.value);
      renderEpisodes([allEpisodes[idx]], allEpisodes.length);
    }
  });
}

window.onload = setup;
