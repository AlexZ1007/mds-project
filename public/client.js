const socket = io();

const sendMessage = () => {
  const message = document.getElementById("message").value;
  socket.emit("message", message);
  document.getElementById("message").value = "";
};

socket.on("message", (data) => {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  li.textContent = data;
  messages.appendChild(li);
});

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
