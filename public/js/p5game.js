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
      });
    }
  }


}

function draw() {
  imageMode(CORNER);
  image(backgroundImage, 0, 0, canvasWidth, canvasHeight); // scale image to fill canvas

  for (let cell of cells) {
    cell.hovered = isMouseOver(cell);
    push();
    translate(cell.x, cell.y);

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

      // Draw stats below the card
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
  console.log("Mouse pressed at:", isMyTurn);
  for (let cell of cells) {
    if (isMouseOver(cell) && isMyTurn && !cell.dataAboutCard && selectedCardId !== null) {

      const { row, col } = cell;
      

      console.log(cell.id, row, col, selectedCardId);

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
  return (
    mouseX > cell.x - cell.w / 2 &&
    mouseX < cell.x + cell.w / 2 &&
    mouseY > cell.y - cell.h / 2 &&
    mouseY < cell.y + cell.h / 2
  );
}

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
        if (!image) {
          console.warn(`Image not found for URL: ${cardData.url}`);
        }

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
})

