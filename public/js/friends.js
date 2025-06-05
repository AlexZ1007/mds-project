async function searchUsers() {
    const nickname = document.getElementById('search-bar').value;
    const res = await fetch(`/friends/search?nickname=${nickname}`, { credentials: 'include' });
    const users = await res.json();

    console.log('Search results:', users); // Debugging log

    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'p-4 bg-white shadow rounded-lg flex justify-between items-center';

        let buttonHtml = '';
        if (user.request_status === 0) {
            buttonHtml = `<button class="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">Pending</button>`;
        } else if (user.request_status === 1) {
            buttonHtml = `<button class="bg-green-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">Friends</button>`;
        } else {
            buttonHtml = `<button onclick="sendFriendRequest(${user.user_id})" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Add Friend</button>`;
        }

        userDiv.innerHTML = `
            <span>${user.nickname}</span>
            ${buttonHtml}
        `;
        resultsDiv.appendChild(userDiv);
    });
}

async function sendFriendRequest(friendId) {
    console.log('Sending friend request to:', friendId); // Debugging log

    const res = await fetch('/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId })
    });

    const data = await res.json();
    if (res.status === 200) {
        alert(data.message);
    } else {
        console.error('Error sending friend request:', data.error); // Debugging log
        alert(data.error);
    }
}

async function fetchFriendsAndRequests() {
    const res = await fetch('/friends', { credentials: 'include' });
    const { friends, pending } = await res.json();

    const pendingDiv = document.getElementById('pending-requests');
    pendingDiv.innerHTML = '';
    pending.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'p-4 bg-white shadow rounded-lg flex justify-between items-center';
        requestDiv.innerHTML = `
            <span>${request.nickname}</span>
            <div>
                <button onclick="respondToRequest(${request.friend_request_id}, 1)" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Accept</button>
                <button onclick="respondToRequest(${request.friend_request_id}, 2)" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Deny</button>
            </div>
        `;
        pendingDiv.appendChild(requestDiv);
    });

    const friendsDiv = document.getElementById('friends-list');
    friendsDiv.innerHTML = '';
    friends.forEach(friend => {
        const friendDiv = document.createElement('div');
        friendDiv.className = 'p-4 bg-white shadow rounded-lg flex justify-between items-center';
        friendDiv.innerHTML = `
            <span>${friend.nickname}</span>
            <button onclick="viewProfile(${friend.user_id})" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View Profile</button>
        `;
        friendsDiv.appendChild(friendDiv);
    });
}

function viewProfile(userId) {
    window.location.href = `/profile.html?userid=${userId}`;
}

async function respondToRequest(requestId, status) {
    console.log('Responding to request:', requestId, 'Status:', status); // Debugging log

    const res = await fetch('/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId, status })
    });

    const data = await res.json();
    if (res.status === 200) {
        alert(data.message);
        fetchFriendsAndRequests();
    } else {
        console.error('Error responding to friend request:', data.error); // Debugging log
        alert(data.error);
    }
}

fetchFriendsAndRequests();