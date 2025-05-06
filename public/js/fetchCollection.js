

async function fetchCollection() {
    const res = await fetch('/collection', { credentials: 'include' });
    const data = await res.json();
    // console.log(data);
  
    const collectionDiv = document.getElementById('card-collection');
    if (!collectionDiv) {
      console.error('Card collection container not found.');
      return;
    }
    if (res.status === 200) {
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
    } else {
      collectionDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
    }
}


window.addEventListener("load", () => {
    fetchCollection();
});




