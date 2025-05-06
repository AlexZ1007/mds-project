async function populateProfilePage() {
    const userData = await fetchUserData();
    if (!userData) {
      console.error('Failed to load user data.');
      return;
    }

    // Populate "Your Profile" section
    const profileNickname = document.getElementById('profile-nickname');
    const profileEmail = document.getElementById('profile-email');
    if (profileNickname) profileNickname.textContent = userData.nickname;
    if (profileEmail) profileEmail.textContent = userData.email;

    // Populate "Your Stats" section
    const matchesPlayed = document.getElementById('matches-played');
    const matchesWon = document.getElementById('matches-won');
    const winRate = document.getElementById('win-rate');

    if (matchesPlayed) matchesPlayed.textContent = userData.matches_played;
    if (matchesWon) matchesWon.textContent = userData.matches_won;

    // Calculate win rate
    if (winRate) {
      const winRateValue = userData.matches_played > 0
        ? ((userData.matches_won / userData.matches_played) * 100).toFixed(2)
        : 0;
      winRate.textContent = `${winRateValue}%`;
    }
}

// Call the function when the page loads
window.addEventListener('load', populateProfilePage);