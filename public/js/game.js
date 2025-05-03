const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get('lobby_id');

socket.emit('join_lobby', { lobbyId });

let isMyTurn = false;

const endRoundBtn = document.getElementById('endRoundBtn');

endRoundBtn.addEventListener('click', () => {
    if (isMyTurn) {
        socket.emit('end_turn', { lobbyId });
        toggleTurn(false);
    }
});

socket.on('your_turn', () => toggleTurn(true));
socket.on('opponent_turn', () => toggleTurn(false));

function toggleTurn(active) {
    isMyTurn = active;
    endRoundBtn.disabled = !active;
    endRoundBtn.classList.toggle('bg-orange-500', active);
    endRoundBtn.classList.toggle('bg-gray-500', !active);
    endRoundBtn.classList.toggle('cursor-not-allowed', !active);
    endRoundBtn.classList.toggle('cursor-pointer', active);
}
