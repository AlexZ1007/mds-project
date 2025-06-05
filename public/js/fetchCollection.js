async function fetchCollection(targetContainerId = 'card-collection') {
    const res = await fetch('/collection', { credentials: 'include' });
    const data = await res.json();
    const cards = data.cards;

    // Filter out cards with 0 count
    const filteredCards = cards.filter(card => card.card_count > 0);

    const collectionDiv = document.getElementById(targetContainerId);
    if (!collectionDiv) {
      console.error(`Container with ID "${targetContainerId}" not found.`);
      return;
    }
    if (res.status === 200) {
      collectionDiv.innerHTML = ''; // Clear previous content

      if (targetContainerId === 'card-collection') {
        filteredCards.forEach(card => {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'card-container';
          cardDiv.dataset.cardId = card.card_id;
          cardDiv.innerHTML = `
            <div class="card-image">
              <div class="card-count">${card.card_count}</div>
              <img src="${card.card_image}" alt="${card.card_name}" class="w-full">
            </div>
          `;
          collectionDiv.appendChild(cardDiv);
        });
        initializeCardClickEvents(filteredCards);
      }
      else if (targetContainerId === 'home-collection') {
        filteredCards.slice(0,4).forEach(card => {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'bg-gray-100 p-4 rounded-lg shadow';
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




