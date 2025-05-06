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
    packResultDiv.innerHTML = ''; 

    if (data.pack.length === 1) {
      packResultDiv.className = 'flex justify-center items-center'; 
    } else {
      packResultDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-6'; 
    }

    data.pack.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'bg-white p-6 rounded-lg shadow-lg flex flex-col items-center w-full md:w-80'; 
      cardDiv.innerHTML = `
        <img src="${card.card_image}" alt="${card.card_name}" class="w-full mb-4"> 
        <h4 class="text-lg font-semibold text-center">${card.card_name} <span class="text-sm text-gray-500">(Level: ${card.level})</span></h4>
        <p class="text-sm text-gray-600 text-center">${card.description}</p>
      `;
      packResultDiv.appendChild(cardDiv);
    });
  } else {
    packResultDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
  }
}