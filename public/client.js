async function register() {
  const username = document.getElementById('reg-user').value;
  const password = document.getElementById('reg-pass').value;
  const email = document.getElementById('reg-email').value;

  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  });

  const data = await res.json();
  const messageElement = document.getElementById('reg-msg');

  if (res.status === 200) {
    messageElement.innerText = data.message;
    messageElement.style.color = 'green';
    window.location.href = '/home.html'
  } else {
    messageElement.innerText = data.error;
    messageElement.style.color = 'red';
  }
}

async function login() {
  const username = document.getElementById('log-user').value;
  const password = document.getElementById('log-pass').value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  const messageElement = document.getElementById('log-msg');


  if (res.status === 201) {
    messageElement.innerText = data.message;
    messageElement.style.color = 'green';
    console.log(data)
    window.location.href = '/home.html'
  } else {
    messageElement.innerText = data.error;
    messageElement.style.color = 'red';
  }
}

async function openPack(pack_info) {
  const res = await fetch('/pack', {
    credentials: 'include',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pack_info: pack_info })
  });

  const data = await res.json();
  const packResultDiv = document.getElementById('pack-result');

  if (res.status === 202) {
    packResultDiv.innerHTML = ''; // Clear previous results

    if (data.pack.length === 1) {
      packResultDiv.className = 'flex justify-center items-center'; 
    } else {
      packResultDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-6'; 
    }

    data.pack.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'bg-white p-6 rounded-lg shadow-lg flex flex-col items-center w-full md:w-80'; 
      cardDiv.innerHTML = `
        <img src="${card.card_image}" alt="${card.card_name}" class="w-full mb-4"> <!-- Bigger and rectangular -->
        <h4 class="text-lg font-semibold text-center">${card.card_name} <span class="text-sm text-gray-500">(Level: ${card.level})</span></h4>
        <p class="text-sm text-gray-600 text-center">${card.description}</p>
      `;
      packResultDiv.appendChild(cardDiv);
    });
  } else {
    packResultDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
  }
}


async function createCardModal(card) {
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
  modal.id = 'card-modal';

  // Create the modal content
  modal.innerHTML = `
    <div class="bg-purple-50 border-8 border-purple-500 rounded-2xl shadow-lg p-6 w-11/12 max-w-md relative">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" id="close-modal">
        &times;
      </button>
      <div class="flex flex-col items-center">
        <img src="${card.card_image}" alt="${card.card_name}" class="w-auto h-64 mb-4 object-contain">
        <h2 class="text-2xl font-bold mb-4 text-purple-700">${card.card_name}(Level ${card.level})</h2>
        <div class="grid grid-cols-2 gap-4 w-full">
          <!-- Left Column: Description -->
          <div class="text-gray-700 italic">
            <p>${card.description}</p>
          </div>
          <!-- Right Column: Mana, HP, and Attack -->
          <div class="text-gray-700">
            <p><strong>Mana:</strong> ${card.mana_points}</p>
            <p><strong>HP:</strong> ${card.HP_points}</p>
            <p><strong>Attack:</strong> ${card.damage}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append the modal to the body
  document.body.appendChild(modal);
  
  // Add event listener to close the modal
  document.getElementById('close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close the modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Add event listeners to card images
async function initializeCardClickEvents(cards) {
  const cardCollectionDiv = document.getElementById('card-collection');
  if (!cardCollectionDiv) {
    console.error('Card collection container not found.');
    return;
  }
  cardCollectionDiv.addEventListener('click', (e) => {
    const cardElement = e.target.closest('.card-container');
    if (cardElement) {
      const cardId = cardElement.dataset.cardId; // Assuming each card has a unique ID
      const card = cards.find((c) => c.card_id === parseInt(cardId)); // Find the card data
      if (card) {
        createCardModal(card);
      }
      else{
        console.error('Card data not found for ID:', cardId);

      }
    }
  });
}


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

window.addEventListener("load",fetchCollection);
