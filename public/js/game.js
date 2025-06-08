const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get('lobby_id');

socket.emit('join_lobby', { lobbyId });

let isMyTurn = false;
let gameEnded = false;


const endRoundBtn = document.getElementById('endRoundBtn');
const drawCardBtn = document.getElementById('drawCardBtn');

endRoundBtn.addEventListener('click', () => {
    if (isMyTurn) {
        socket.emit('end_turn', { lobbyId });
        toggleTurn(false);
    }
});

drawCardBtn.addEventListener('click', () => {
    if (isMyTurn) {
        socket.emit('draw_card', { lobbyId });
    }
});


socket.on('your_turn', () => toggleTurn(true));
socket.on('opponent_turn', () => toggleTurn(false));

function toggleTurn(active) {
    isMyTurn = active;

    // End Turn Button
    endRoundBtn.disabled = !active;
    endRoundBtn.classList.toggle('bg-orange-500', active);
    endRoundBtn.classList.toggle('bg-gray-500', !active);
    endRoundBtn.classList.toggle('cursor-not-allowed', !active);
    endRoundBtn.classList.toggle('cursor-pointer', active);

    // Draw Card Button
    drawCardBtn.disabled = !active;
    drawCardBtn.classList.toggle('bg-blue-500', active);
    drawCardBtn.classList.toggle('bg-gray-500', !active);
    drawCardBtn.classList.toggle('cursor-not-allowed', !active);
    drawCardBtn.classList.toggle('cursor-pointer', active);
}

let selectedCardId = null;

function renderHand(hand) {
    const handContainer = document.getElementById('hand-cards');
    handContainer.innerHTML = '';

    hand.forEach((src, index) => {
    const card = document.createElement('img');
    card.src = src;
    card.alt = `Card ${index}`;
    card.className = `rounded-lg shadow-md cursor-pointer transition-all duration-300 w-[2200px] h-[240px] object-cover ${
        selectedCardId === index ? 'ring-4 ring-yellow-400 z-10' : ''
    }`;
    card.addEventListener('click', () => {
        selectedCardId = selectedCardId === index ? null : index;
        renderHand(hand);
        console.log("Selected card ID:", selectedCardId);
    });
    handContainer.appendChild(card);
    });
}


