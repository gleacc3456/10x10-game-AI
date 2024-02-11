const mapSize = [10, 10];
const network = new brain.NeuralNetwork({hiddenLayers: [5,5], activation: 'sigmoid'});

network.train([
  {input: [0,0,2,3], output: [0,1,0,0]},
  {input: [0,1,2,3], output: [0,1,0,0]},
  {input: [0,2,2,3], output: [0,1,0,0]},
  {input: [0,3,2,3], output: [0,0,0,1]},
  {input: [1,3,2,3], output: [0,0,0,1]},

  {input: [3,3,2,3], output: [0,0,1,0]},
  {input: [1,4,2,3], output: [1,0,0,0]},
  {input: [2,4,2,3], output: [1,0,0,0]},
  {input: [2,5,2,3], output: [1,0,0,0]},
  {input: [2,6,2,3], output: [1,0,0,0]},
  {input: [2,7,2,3], output: [1,0,0,0]},
  {input: [2,8,2,3], output: [1,0,0,0]},
  {input: [2,9,2,3], output: [0,1,0,0]},
  {input: [2,0,2,3], output: [0,1,0,0]},
  {input: [2,1,2,3], output: [0,1,0,0]},
  {input: [2,2,2,3], output: [0,1,0,0]},

  {input: [9,3,2,3], output: [0,0,0,1]},
  {input: [8,3,2,3], output: [0,0,0,1]},
  {input: [7,3,2,3], output: [0,0,0,1]},

  {input: [9,2,2,3], output: [0,0,0,1]},
  {input: [8,2,2,3], output: [0,0,0,1]},
  {input: [7,2,2,3], output: [0,0,0,1]},
  {input: [0,4,2,3], output: [0,1,0,0]},
  {input: [8,5,2,3], output: [1,0,0,0]},
  {input: [7,5,2,3], output: [1,0,0,0]},
  {input: [5,4,2,3], output: [1,0,0,0]},
  {input: [0,5,2,3], output: [0,0,0,1]},
  {input: [0,6,2,3], output: [0,0,0,1]},
  {input: [0,4,2,3], output: [0,0,0,1]},
  {input: [0,7,2,3], output: [1,0,0,0]},
  {input: [4,5,2,3], output: [1,0,0,0]},
])
let playerProperties = {
  position: [randomiser(1), randomiser(1)],
  health: 20,
  maxHealth: 20,
  food: 1,
};
let foodCoords = [
  [2, 3],
];
let superFoodCoords = [
  [3,0]
]
const enemyCoords = []
const updateInterval = 500; // Update every 1000 milliseconds (1 second)
let gameLoopTimer;

let moveCounter = 1;

function getListElement(index) {
  // Handle negative indexing
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (index < 0) {
    index = arr.length + index;
  }
  // Return the element at the specified index
  return arr[index];
}

function coordConv(x, y) {
  return `${getListElement(y)},${getListElement(x)}`;
}

function moveUp() {
  const x = playerProperties.position;
  moveCharacter(x[0], x[1] - 1);
}

function moveDown() {
  const x = playerProperties.position;
  moveCharacter(x[0], x[1] + 1);
}

function moveRight() {
  const x = playerProperties.position;
  moveCharacter(x[0] + 1, x[1]);
}

function moveLeft() {
  const x = playerProperties.position;
  moveCharacter(x[0] - 1, x[1]);
}

function randomiser(digits) {
  return Math.floor(Math.random() * 10 ** digits)
}

function update() {
  const foodIndex = foodCoords.findIndex(coord => JSON.stringify(coord) === JSON.stringify(playerProperties.position));
  const enemyIndex = enemyCoords.findIndex(coord => JSON.stringify(coord) === JSON.stringify(playerProperties.position));
  const superIndex = superFoodCoords.findIndex(coord => JSON.stringify(coord) === JSON.stringify(playerProperties.position));

  if ((foodIndex !== -1) && (playerProperties.maxHealth > playerProperties.health)) {
    playerProperties.health += 2;
    foodCoords.splice(foodIndex, 1); // Remove the collected food coordinate
  }
  if (enemyIndex !== -1) {
    playerProperties.health -= 3;
    enemyCoords.splice(enemyIndex, 1)
  }
  if (superIndex !== -1) {
    playerProperties.health = playerProperties.maxHealth +1;
  }
  if (foodIndex !== -1) {
    playerProperties.food++;
  }
  if (moveCounter % 5 == 0) {
    playerProperties.health -= 1;
  }
  if (playerProperties.food%5==0) {
    playerProperties.maxHealth++;
    playerProperties.food++;
  }

  if (playerProperties.health == 0) {
    playerProperties = {
      position: [0, 0],
      health: 20,
      maxHealth: 20,
      food: 0,
    };
    stopGameLoop()
  }
  document.getElementById(coordConv(...playerProperties.position)).innerHTML = "<div class='character'></div>";
  document.getElementById(`health`).innerHTML = `${playerProperties.health}/${playerProperties.maxHealth}`;
  

  const output = network.run([...playerProperties.position, 2, 3]);
  
  // Find the index of the highest value in the output array
  const highestIndex = output.indexOf(Math.max(...output));
  
  // Create an array with all zeros
  const choice = Array(output.length).fill(0);
  
  // Set the highest value to 1
  choice[highestIndex] = 1;

  switch(JSON.stringify(choice)) {
    case '[1,0,0,0]':
      moveUp();
      break;
    case '[0,1,0,0]':
      moveDown();
      break;
    case '[0,0,1,0]':
      moveLeft();
      break;
    case '[0,0,0,1]':
      moveRight();
      break;
  }

}

function moveCharacter(x, y) {
  moveCounter++;
  // Calculate new position with modulo to ensure it stays within map bounds
  const newX = (x + mapSize[0]) % mapSize[0];
  const newY = (y + mapSize[1]) % mapSize[1];
  
  const previous = playerProperties.position;
  playerProperties.position = [newX, newY];
  
  // Get current and previous elements based on the new and previous positions
  const currentElement = document.getElementById(coordConv(newX, newY));
  const previousElement = document.getElementById(coordConv(...previous));
  
  // Check if elements exist before accessing their innerHTML
  if (currentElement) {
    currentElement.innerHTML = "<div class='character'></div>";
  }
  if (previousElement) {
    previousElement.innerHTML = '';
  }
  
  // Check if the player has reached the edge of the map and needs to teleport
  if (x < 0 || y < 0 || x >= mapSize[0] || y >= mapSize[1]) {
    // Teleport the player to the opposite side of the map
    const oppositeX = (x + mapSize[0]) % mapSize[0];
    const oppositeY = (y + mapSize[1]) % mapSize[1];
    playerProperties.position = [oppositeX, oppositeY];
  }
}


document.addEventListener('keydown', function(event) {
  // Check which key is pressed using event.keyCode
  switch (event.keyCode) {
    case 87: // W key
      moveUp();
      break;
    case 83: // S key
      moveDown();
      break;
    case 65: // A key
      moveLeft();
      break;
    case 68: // D key
      moveRight();
      break;
    default:
      // Do nothing for other keys
      break;
  }
});

function startGameLoop() {
  gameLoopTimer = setInterval(update, updateInterval);
}

function stopGameLoop() {
  clearInterval(gameLoopTimer);
}

// Call startGameLoop to begin the game loop
startGameLoop();