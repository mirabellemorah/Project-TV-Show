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

  episodeCard.querySelector(".episode-title").textContent = episode.name;

  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedEpisode = String(episode.number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedEpisode}`;

  episodeCard.querySelector(".episode-season").textContent = `${episodeCode}`;
  episodeCard.querySelector(".episode-number").remove(); // remove extra line if you're not using it

  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

  const img = episodeCard.querySelector(".episode-image");
  img.src =
    episode.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = episode.name;

  return episodeCard;
}

function setup() {
  const allEpisodes = getAllEpisodes(); // comes from episodes.js
  const episodeCards = allEpisodes.map(makePageForEpisodes);
  document.getElementById("root").append(...episodeCards);
}

window.onload = setup;
