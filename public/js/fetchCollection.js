

async function fetchCollection(targetContainerId = 'card-collection') {
    const res = await fetch('/collection', { credentials: 'include' });
    const data = await res.json();
    // console.log(data);
  
    const collectionDiv = document.getElementById(targetContainerId);
    if (!collectionDiv) {
      console.error(`Container with ID "${targetContainerId}" not found.`);
      return;
    }
    if (res.status === 200) {
      //sorting the cards by card_count in descending order
      data.cards.sort((a, b) => b.card_count - a.card_count);

      collectionDiv.innerHTML = ''; // Clear previous content

      if (targetContainerId === 'card-collection') {
        data.cards.forEach(card => {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'card-container';
          cardDiv.dataset.cardId = card.card_id; // Store the card ID for later use
          cardDiv.innerHTML = `
            <div class="card-image">
              <div class="card-count">${card.card_count}</div>
              <img src="${card.card_image}" alt="${card.card_name}" class="w-full">
            </div>
          `;
          collectionDiv.appendChild(cardDiv);
        });
        // Initialize click events for the cards
        initializeCardClickEvents(data.cards);
      }
      else if (targetContainerId === 'home-collection') {
        data.cards.slice(0,4).forEach(card => {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'bg-gray-100 p-4 rounded-lg shadow';
          // cardDiv.dataset.cardId = card.card_id; // Store the card ID for later use
          cardDiv.innerHTML = `
            <div class="card-image-in-home">
              <img src="${card.card_image}" alt="${card.card_name}" class="w-full">
            </div>
          `;
          collectionDiv.appendChild(cardDiv);
        });
      } 
    } else {
      collectionDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
    }
}


window.addEventListener("load", () => {
    fetchCollection();
});




