let cells = [];
let cardImageMap = {};
const imagePaths = [
  '/img/broom_L1.jpg',
  '/img/gloomroot_L2.jpg',
  '/img/voidgate_L3.jpg',
  '/img/enchanted_book_L2.jpg',
  '/img/hexpaw_L2.jpg',
];

const rows = 4;
const cols = 4;
const cardWidth = 100;
const cardHeight = 140;
const padding = 30;
const canvasWidth = 800;
const canvasHeight = 700;

let backgroundImage;

function preload() {
  backgroundImage = loadImage('/img/arena_background.png');
  for (let path of imagePaths) {
    cardImageMap[path] = loadImage(path);
  }
}

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-wrapper');
  rectMode(CENTER);
  imageMode(CENTER);
  noFill();

  const totalGridWidth = cols * cardWidth + (cols - 1) * padding;
  const totalGridHeight = rows * cardHeight + (rows - 1) * padding;
  const offsetX = (width - totalGridWidth) / 2 + cardWidth / 2;
  const offsetY = (height - totalGridHeight) / 2 + cardHeight / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (cardWidth + padding);
      const y = offsetY + r * (cardHeight + padding);

      cells.push({
        id: r * cols + c,
        x,
        y,
        w: cardWidth,
        h: cardHeight,
        hovered: false,
        row: r,
        col: c,
        dataAboutCard: null,
        animation: null,
      });
    }
  }
}

function draw() {
  imageMode(CORNER);
  image(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  for (let cell of cells) {
    cell.hovered = isMouseOver(cell);

    let animY = cell.y;

    // Animate collapse
    if (cell.animation && cell.animation.type === 'collapse') {
      const a = cell.animation;
      const progress = a.frame / a.duration;
      const easing = easeOutCubic(progress);
      animY = lerp(a.fromY, a.toY, easing);
      a.frame++;

      if (a.frame >= a.duration) {
        cell.animation = null;
      }
    }

    push();
    translate(cell.x, animY);

    if (cell.hovered) {
      scale(1.1);
      stroke('#eab308');
      strokeWeight(3);
      fill(30, 20, 10, 100);
    } else {
      stroke('#ccc');
      strokeWeight(1);
      fill(40, 30, 20, 80);
    }

    rect(0, 0, cell.w, cell.h, 16);

    if (cell.dataAboutCard) {
      imageMode(CENTER);
      image(cell.dataAboutCard.img, 0, 0, cell.w * 0.8, cell.h * 0.8);

      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      text(`ATK: ${cell.dataAboutCard.attack}  HP: ${cell.dataAboutCard.hp}`, 0, cell.h / 2 + 12);
    }

    pop();
  }
}

function mousePressed() {
  if (gameEnded) return false;

  for (let cell of cells) {
    if (isMouseOver(cell) && isMyTurn && !cell.dataAboutCard && selectedCardId !== null) {
      const { row, col } = cell;
      socket.emit("place_card", {
        row,
        col,
        lobbyId,
        selectedCardId
      });
      break;
    }
  }
}

function isMouseOver(cell) {
  if (gameEnded) return false;

  return (
    mouseX > cell.x - cell.w / 2 &&
    mouseX < cell.x + cell.w / 2 &&
    mouseY > cell.y - cell.h / 2 &&
    mouseY < cell.y + cell.h / 2
  );
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function startBattleAnimation(cell1, cell2 = null) {
  const offset = 30;
  const duration = 10;

  const direction1 = cell1.row === 1 ? 1 : -1; // row 1 goes down, row 2 goes up
  cell1.animation = {
    type: 'collapse',
    frame: 0,
    duration,
    fromY: cell1.y,
    toY: cell1.y + direction1 * (cell2 ? offset : offset * 2),
  };

  if (cell2) {
    const direction2 = cell2.row === 2 ? -1 : 1;
    cell2.animation = {
      type: 'collapse',
      frame: 0,
      duration,
      fromY: cell2.y,
      toY: cell2.y + direction2 * offset,
    };
  }
}


// Socket Events
socket.on("your_turn", () => {
  isMyTurn = true;
});

socket.on("opponent_turn", () => {
  isMyTurn = false;
});

socket.on('update_map', ({ map }) => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cardData = map[r][c];
      const cell = cells.find(cell => cell.row === r && cell.col === c);
      if (!cell) continue;

      if (cardData) {
        const image = cardImageMap[cardData.url] || null;
        cell.dataAboutCard = {
          img: image || null,
          attack: cardData.attack,
          hp: cardData.hp,
        };
      } else {
        cell.dataAboutCard = null;
      }
    }
  }
});

socket.on('player_data', ({ player, opponent }) => {
  document.getElementById('playerMana').textContent = player.mana;
  document.getElementById('playerHp').textContent = player.hp;
  document.getElementById('opponentMana').textContent = opponent.mana;
  document.getElementById('opponentHp').textContent = opponent.hp;
  renderHand(player.hand);
});

socket.on('battle', ({ card1, card2, column }) => {
  const cell1 = cells.find(cell => cell.row === 1 && cell.col === column);
  const cell2 = cells.find(cell => cell.row === 2 && cell.col === column);

  if (cell1 && cell2) {
    startBattleAnimation(cell1, cell2);
  }
});


socket.on('player_damage', ({ card, column }) => {
  let cell = cells.find(cell => cell.row === 1 && cell.col === column && cell.dataAboutCard);
  if (!cell)  cell = cells.find(cell => cell.row === 2 && cell.col === column);
  
  startBattleAnimation(cell);

  const hpEl = document.getElementById('player-info');
  hpEl.classList.add('damage-pulse');
  setTimeout(() => hpEl.classList.remove('damage-pulse'), 400);
});

socket.on('opponent_damage', ({ card, column }) => {
  let cell = cells.find(cell => cell.row === 1 && cell.col === column && cell.dataAboutCard);
  if (!cell)  cell = cells.find(cell => cell.row === 2 && cell.col === column);  
  
  startBattleAnimation(cell);

  const hpEl = document.getElementById('opponent-info');
  hpEl.classList.add('damage-pulse');
  setTimeout(() => hpEl.classList.remove('damage-pulse'), 1000);
});


socket.on('game_over', (payload) => {
  gameEnded = true;
  isMyTurn = false;
  selectedCardId = null;
  showGameOverModal(payload);
});