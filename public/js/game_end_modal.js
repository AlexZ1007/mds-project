function showGameOverModal({ status, coins, trophies }) {
    const modal = document.getElementById('gameOverModal');
    const statusEl = document.getElementById('gameOverStatus');
    const coinsEl = document.getElementById('gameOverCoins');
    const trophiesEl = document.getElementById('gameOverTrophies');

    // Set text and color
    if (status === 'win') {
      statusEl.textContent = 'Victory!';
      statusEl.classList.add('text-green-400');
      statusEl.classList.remove('text-red-400');
    } else {
      statusEl.textContent = 'Defeated!';
      statusEl.classList.add('text-red-400');
      statusEl.classList.remove('text-green-400');
    }

    coinsEl.textContent = (coins > 0 ? '+' : '') + coins;
    trophiesEl.textContent = (trophies > 0 ? '+' : '') + trophies;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Disable background scroll
  }

  function closeGameOverModal() {
    const btn = document.querySelector("#gameOverModal button");
    btn.disabled = true;
    window.location.href = "/home.html"

  }
