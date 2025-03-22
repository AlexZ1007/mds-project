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
