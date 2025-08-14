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

// the below code is to get all episodes and append them to the root element
// it uses the getAllEpisodes function from episodes.js
// and maps each episode to a card using the makePageForEpisodes function
// then appends all the cards to the root element
// this is the main function that runs when the page loads
// it is called in the window.onload function

function setup() {
  const allEpisodes = getAllEpisodes(); // comes from episodes.js
  const episodeCards = allEpisodes.map(makePageForEpisodes);
  document.getElementById("root").append(...episodeCards);
  filterEpisodes();
  episodeSelect();
}

//Adding the search and filter functionality
// This function filters the episodes based on the search input
// It listens for input changes in the search bar and shows/hides episodes accordingly
// It also updates the count of matching episodes

function filterEpisodes() {
  // Get the search input and episode cards
  const searchInput = document.getElementById("search-bar");
  const episodeCards = document.querySelectorAll(".episode-card");

  // Show total episodes on initial load
  document.getElementById(
    "epMatchCount"
  ).textContent = `${episodeCards.length} episode(s) found`;

  // Add an event listener to the search input
  // This will filter the episodes based on the search input
  // It will show episodes that match the search criteria and hide those that don't
  searchInput.addEventListener("input", () => {
    //Reset the select dropdown to "All episodes" when searching
    const select = document.getElementById("selector");
    select.value = "all-episodes";

    // Get the input value and convert it to lowercase for case-insensitive comparison
    const inputValue = searchInput.value.toLowerCase();
    let matchCount = 0;

    episodeCards.forEach((card) => {
      const title = card
        .querySelector(".episode-title")
        .textContent.toLowerCase();
      const summary = card
        .querySelector(".episode-summary")
        .textContent.toLowerCase();

      // Check if the input value matches the title or summary
      // If it matches, show the card; otherwise, hide it
      if (
        inputValue === "" ||
        title.includes(inputValue) ||
        summary.includes(inputValue)
      ) {
        card.style.display = "block";
        matchCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Update the count of matching episodes
    // This will show how many episodes match the search criteria
    document.getElementById(
      "epMatchCount"
    ).textContent = `${matchCount} / ${episodeCards.length} episode(s) found`;
  });
}

function episodeSelect() {
  const select = document.getElementById("selector");
  const episodeCards = document.querySelectorAll(".episode-card");

  // Clear previous options
  select.innerHTML = "";

  // Add "All episodes" option
  const allOption = document.createElement("option");
  allOption.value = "all-episodes";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

  // Populate the select dropdown with episode options
  episodeCards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.querySelector(".episode-season").textContent;
    const epTitle = card.querySelector(".episode-title").textContent;
    option.textContent = `${option.value} - ${epTitle}`;
    select.appendChild(option);
  });

  // Handle selection

  select.addEventListener("change", () => {
    // Reset the search input when changing the selection
    const searchInput = document.getElementById("search-bar");
    searchInput.value = "";

    // Show or hide episode cards based on the selected value
    const selectedValue = select.value;
    if (selectedValue === "all-episodes") {
      episodeCards.forEach((card) => (card.style.display = "block"));

      // Update the count of matching episodes to show all
      document.getElementById(
        "epMatchCount"
      ).textContent = `${episodeCards.length} episode(s) found`;
    } else {
      episodeCards.forEach((card) => {
        const code = card.querySelector(".episode-season").textContent;
        card.style.display = code === selectedValue ? "block" : "none";

        // Update the count of matching episodes based on the selection
        document.getElementById("epMatchCount").textContent = `${
          document.querySelectorAll(".episode-card[style='display: block;']")
            .length
        } episode(s) found`;
      });
    }
  });
}
window.onload = setup;
