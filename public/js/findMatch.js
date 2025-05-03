const socket = io();

const findGame = () => {
    // user ID
    console.log('okk')
    socket.emit("find_match");
};

document.getElementById('find_match').addEventListener('click', findGame)

socket.on("match_found", (data) => {
    window.location.href = data.url
})
