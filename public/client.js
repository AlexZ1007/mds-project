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
    window.location.href='/home.html'
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
    window.location.href='/home.html'
  } else {
    messageElement.innerText = data.error;
    messageElement.style.color = 'red';
  }
}

async function openPack(pack_type) {
  

  const res = await fetch('/pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pack_type: pack_type }) 
  });


  const data = await res.json();
  const packResultDiv = document.getElementById('pack-result');

  if (res.status === 202) {
    packResultDiv.innerHTML = '<h3 class="text-xl font-bold mb-4">Pack Opened!</h3>';
    data.pack.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'bg-white p-4 rounded-lg shadow mb-4';
      cardDiv.innerHTML = `
        <h4 class="text-lg font-semibold">${card.card_id}: ${card.name}</h4>
        <p>${card.description}</p>
        <p><strong>Mana Points:</strong> ${card.mana_points}</p>
        <p><strong>HP Points:</strong> ${card.HP_points}</p>
        <p><strong>Damage:</strong> ${card.damage}</p>
        <p><strong>Ability:</strong> ${card.ability}</p>
        <img src="${card.card_image}" alt="${card.name}" class="w-32 h-32 mt-2">
      `;
      packResultDiv.appendChild(cardDiv);
    });
  } else {
    packResultDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
  }
}
