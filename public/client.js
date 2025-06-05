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

  if (res.status === 202) {
    // Show the cards in a modal pop-up
    showPackModal(data.pack);

    // Update the balance dynamically
    const userData = await fetchUserData();
    if (userData) {
      const coinsElement = document.getElementById('user-coins');
      if (coinsElement) {
        coinsElement.textContent = `${userData.balance}`;
      }
    }
  } else if (data.error && data.error.toLowerCase().includes('not enough coins')) {
    showNoCoinsModal();
  } else {
    // Optionally show error in a modal or as before
    alert(data.error || 'Failed to open pack.');
  }
}


function showNoCoinsModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50';
  modal.id = 'no-coins-modal';

  modal.innerHTML = `
    <div class="bg-white border-8 border-yellow-400 rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl" id="close-no-coins-modal">&times;</button>
      <h2 class="text-2xl font-bold mb-4 text-yellow-600">Not Enough Coins</h2>
      <p class="text-gray-700 mb-6 text-center">You don't have enough coins to open this pack.<br>Play games to earn more coins!</p>
      <button id="go-home-btn" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">Go to Home</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-no-coins-modal').onclick = () => document.body.removeChild(modal);
  document.getElementById('go-home-btn').onclick = () => window.location.href = '/home.html';

  // Optional: close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}


async function createCardModal(card) {
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
  modal.id = 'card-modal';

  // Only show merge button if enough cards
  let mergeButtonHtml = '';
  if ((card.level === 1 || card.level === 2) && card.card_count >= 2) {
    mergeButtonHtml = `
      <button id="merge-btn" class="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
        Merge
      </button>
    `;
  }

  modal.innerHTML = `
    <div class="bg-purple-50 border-8 border-purple-500 rounded-2xl shadow-lg p-6 w-11/12 max-w-md relative">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" id="close-modal">
        &times;
      </button>
      <div class="flex flex-col items-center">
        <img src="${card.card_image}" alt="${card.card_name}" class="w-auto h-64 mb-4 object-contain">
        <h2 class="text-2xl font-bold mb-4 text-purple-700">${card.card_name}(Level ${card.level})</h2>
        <div class="grid grid-cols-2 gap-4 w-full">
          <div class="text-gray-700 italic">
            <p>${card.description}</p>
          </div>
          <div class="text-gray-700">
            <p><strong>Mana:</strong> ${card.mana_points}</p>
            <p><strong>HP:</strong> ${card.HP_points}</p>
            <p><strong>Attack:</strong> ${card.damage}</p>
          </div>
        </div>
        ${mergeButtonHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // Add event listener for merge button if it exists
  if ((card.level === 1 || card.level === 2) && card.card_count >= 2) {
    document.getElementById('merge-btn').onclick = () => {
      document.body.removeChild(modal);
      showMergeModal(card);
    };
  }
}

async function showMergeModal(card) {
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
  modal.id = 'merge-modal';

  // Set the modal's HTML
  modal.innerHTML = `
    <div class="bg-purple-50 border-8 border-purple-500 rounded-2xl shadow-lg p-8 w-[40rem] relative flex flex-col items-center">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" id="close-merge-modal">&times;</button>
      <div class="flex items-center justify-center gap-12">
        <img src="${card.card_image}" alt="${card.card_name}" class="w-40 h-60 object-contain rounded"/>
        <span class="text-5xl font-bold text-purple-600">→</span>
        <img src="${card.card_image}" alt="${card.card_name}" class="w-40 h-60 object-contain rounded opacity-70"/>
      </div>
      <div class="mt-8 text-center">
        <p class="text-lg">Merge two <b>${card.card_name}</b> (Level ${card.level}) to get one Level ${card.level + 1} card.</p>
        <button id="confirm-merge-btn" class="mt-8 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded text-xl">
          Merge Now
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-merge-modal').onclick = () => document.body.removeChild(modal);

  document.getElementById('confirm-merge-btn').onclick = async () => {
    const cardId = card.card_id || card.id;
    const level = card.level;

    const res = await fetch('/merge-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ card_id: cardId, level: level })
    });
    const data = await res.json();
    if (res.ok) {
      document.body.removeChild(modal);
      location.reload(); // Just reload, no alert
    } else {
      alert(data.error || 'Merge failed.');
    }
  };
};


function showPackModal(cards) {
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50';
  modal.id = 'pack-modal';

  // Build the cards HTML
  const cardsHtml = cards.map(card => `
    <div class="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center w-44">
      <img src="${card.card_image}" alt="${card.card_name}" class="w-full mb-2">
      <h4 class="text-base font-semibold text-center">${card.card_name} <span class="text-xs text-gray-500">(Level: ${card.level})</span></h4>
      <p class="text-xs text-gray-600 text-center">${card.description}</p>
    </div>
  `).join('');

  // Modal content: smaller and cards in a row
  modal.innerHTML = `
    <div class="bg-purple-50 border-8 border-purple-500 rounded-2xl shadow-lg p-6 max-w-xl w-full relative flex flex-col items-center">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl" id="close-pack-modal">&times;</button>
      <h2 class="text-xl font-bold mb-4 text-purple-700">You received:</h2>
      <div class="flex flex-row justify-center gap-4">${cardsHtml}</div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-pack-modal').onclick = () => document.body.removeChild(modal);

  // Optional: close modal when clicking outside
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
      else {
        console.error('Card data not found for ID:', cardId);

      }
    }
  });
}


async function fetchUserData(userId = null) { 
  try {

    const url = userId ? `/user-data?profile_user_id=${encodeURIComponent(userId)}` : '/user-data'; // Adjust the URL based on whether userId is provided
     const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      console.error('Failed to fetch user data:', response.statusText);
      return;
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data', error);
    return null;
  }
}


async function loadNavbar() {
  // Fetch the navbar HTML from a separate file (e.g., navbar.html)
  try {
    const response = await fetch('/components/navbar.html');
    if (!response.ok) {
      console.error('Failed to load navbar:', response.statusText);
      return;
    }

    // Get the HTML content of the navbar
    const navbarHTML = await response.text();

    // Insert the navbar HTML at the top of the body
    const navbarContainer = document.createElement('div');
    navbarContainer.innerHTML = navbarHTML;
    document.body.insertBefore(navbarContainer, document.body.firstChild);
    // Fetch user data and update the nickname
    const userData = await fetchUserData();
    if (userData) {
      const nicknameElement = document.querySelector('.user-nickname');
      // const 
      if (nicknameElement) {
        nicknameElement.textContent = "Hello, " + userData.nickname;
      }

      // to display the coins
      const coinsElement = document.getElementById('user-coins');
      if (coinsElement) {
        coinsElement.textContent = `${userData.balance}`;
      }

      // to display the elo
      const eloElement = document.getElementById('user-elo');
      if(eloElement){
        eloElement.textContent = `${userData.elo}`;
      }

      navbarContainer.querySelector('#logoutBtn')?.addEventListener('click', async () => {
        try {
          const response = await fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            window.location.href = '/';
          } else {
            console.error('Logout failed');
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
      });

    }
  } catch (error) {
    console.error('Error loading navbar:', error);
  }
}


window.addEventListener("load", () => {

  // Check if the current page is one of the specified pages
  const validPages = ['/collection.html', '/shop.html', '/home.html', '/profile.html', '/friends.html'];
  if (validPages.includes(window.location.pathname)) {
    loadNavbar(); // Load the navbar only on the specified pages
  }
});
