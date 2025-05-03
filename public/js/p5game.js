let cards = [];
let dragonImg;
const rows = 4;
const cols = 4;
const cardWidth = 100;
const cardHeight = 140;
const padding = 30;

function preload() {
  // Load your dragon image
  dragonImg = loadImage('img/dragon.png');
}

function setup() {
  const canvas = createCanvas(1000,700);
  canvas.parent('canvas-wrapper');
  rectMode(CENTER);
  imageMode(CENTER);
  noFill();

  // Center the grid
  const totalGridWidth = cols * cardWidth + (cols - 1) * padding;
  const totalGridHeight = rows * cardHeight + (rows - 1) * padding;
  const offsetX = (width - totalGridWidth) / 2 + cardWidth / 2;
  const offsetY = (height - totalGridHeight) / 2 + cardHeight / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (cardWidth + padding);
      const y = offsetY + r * (cardHeight + padding);
      cards.push({ id:r*cols+c, x, y, w: cardWidth, h: cardHeight, hovered: false, cardPlaced: false });
    }
  }

  console.log(cards);
}

function draw() {
  background('#ffec8f'); 

  for (let card of cards) {
    card.hovered = isMouseOver(card);
    push();
    translate(card.x, card.y);

    // Fantasy-style border
    if (card.hovered) {
      scale(1.1);
      stroke('#eab308'); // gold
      strokeWeight(3);
      fill(30, 20, 10, 100);
    } else {
      stroke('#ccc');
      strokeWeight(1);
      fill(40, 30, 20, 80);
    }

    rect(0, 0, card.w, card.h, 16); // Rounded fantasy border

    // Draw dragon if placed
    if (card.cardPlaced) {
      image(dragonImg, 0, 0, card.w * 0.8, card.h * 0.8);
    }
    pop();
  }
}

function mousePressed() {
  for (let card of cards) {
    if (isMouseOver(card) && isMyTurn) {
      socket.emit("place_card", {cardId: card.id, lobbyId: lobbyId})
    }
  }
}

function isMouseOver(card) {
  return (
    mouseX > card.x - card.w / 2 &&
    mouseX < card.x + card.w / 2 &&
    mouseY > card.y - card.h / 2 &&
    mouseY < card.y + card.h / 2
  );
}

socket.on("place_card_response", ({cardId}) => {
  console.log(cardId);
  cards.find(c => c.id==cardId).cardPlaced= true;
})
