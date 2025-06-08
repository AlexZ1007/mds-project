let deck = Array(12).fill(null);



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
        cardDiv.className = 'card-container cursor-pointer';
        cardDiv.dataset.cardId = card.card_id;
        cardDiv.innerHTML = `
          <div class="card-image">
            <div class="card-count">${card.card_count}</div>
            <img src="${card.card_image}" alt="${card.card_name}" class="w-full">
          </div>
        `;
        cardDiv.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          addToDeck(card);
        });

        collectionDiv.appendChild(cardDiv);
      });

      renderDeckSlots();
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
function renderDeckSlots() {

  const deckContainer = document.getElementById('deck-container');
  deckContainer.innerHTML = '';

  deck.forEach((card, index) => {
    const slot = document.createElement('div');
    slot.className = 'border border-gray-300 rounded-lg p-1 bg-gray-50 relative min-h-[100px]';

    if (card) {
      slot.innerHTML = `
        <img src="${card.card_image}" class="w-full h-auto rounded cursor-pointer" title="Click to remove">
      `;
      slot.onclick = () => removeFromDeck(index);
    } else {
      slot.innerHTML = `<div class="text-gray-400 text-sm text-center pt-6">YOUR CHOICE</div>`;
    }

    deckContainer.appendChild(slot);
  });
}

async function loadDeckFromServer() {
  const res = await fetch('/deck', { credentials: 'include' });
  const data = await res.json();
  if (res.ok && data.deck) {
    deck = data.deck.map(card => card || null);
    renderDeckSlots();
  }
}

window.addEventListener("load", async () => {
  await fetchCollection();
  await loadDeckFromServer();
});


function addToDeck(card) {
  // Count how many times this card is already in the deck
  const countInDeck = deck.filter(c => c && c.card_id === card.card_id).length;
  if (countInDeck >= card.card_count) {
    showBubbleMessage(
      `You don't have enough of ${card.card_name} (Level ${card.level})!`,
      true
    );
    return;
  }
  const emptyIndex = deck.findIndex(c => c === null);
  if (emptyIndex === -1) {
    showBubbleMessage("Your deck is full!", true);
    return;
  }
  deck[emptyIndex] = card;
  renderDeckSlots();
}

function removeFromDeck(index) {
  deck[index] = null;
  renderDeckSlots();
}

async function saveDeckToServer() {

  const res = await fetch('/deck', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  const data = await res.json();
  if (res.ok) {
    showBubbleMessage("Deck saved!");
  } else {
    showBubbleMessage(`Couldn't save ypur deck. Error saving deck: ${data.error}`, true);
  }
}

function showBubbleMessage(text, isError = false) {
  const bubble = document.getElementById("bubble-message");
  bubble.textContent = text;
  bubble.classList.remove("hidden");
  bubble.classList.remove("bg-yellow-100", "text-yellow-900", "border-yellow-400");
  bubble.classList.remove("bg-red-100", "text-red-900", "border-red-400");

  if (isError) {
    bubble.classList.add("bg-red-100", "text-red-900", "border-red-400");
  } else {
    bubble.classList.add("bg-yellow-100", "text-yellow-900", "border-yellow-400");
  }

  setTimeout(() => {
    bubble.classList.add("hidden");
  }, 2000);
}

