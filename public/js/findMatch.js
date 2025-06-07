const socket = io();

const findGame = () => {
    const btn = document.getElementById('find_match');
    btn.disabled = true;
    btn.innerText = 'In queue';
    btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    btn.classList.add('bg-blue-500', 'cursor-wait');

    socket.emit("find_match");
};

document.getElementById('find_match').addEventListener('click', findGame);

socket.on("match_found", (data) => {
    window.location.href = data.url;
});
