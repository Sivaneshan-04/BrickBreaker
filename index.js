var canvas, canvasContext;

//Block dimensions
const block_width = 80;
const blockHeight = 20;
const blockGap = 2;
const columns = 16;
const rows = 14;
var blockGrid = new Array(columns * rows);
var blockCount = 0;

// Ball
var ballX = 75;
var ballSpeedX = 8;
var ballY = 75;
var ballSpeedY = 8;

// Main Paddle
var paddleX = 400;
const PADDLE_THICKNESS = 15;
const PADDLE_WIDTH = 100;
const PADDLE_DIST_FROM_EDGE = 60;

// Mouse
var mouseX = 0;
var mouseY = 0;


window.onload = () => {
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");

    document.addEventListener("keydown",gameStarter);
};

function gameStarter(event){
    if (event.code === "Space") {
        document.getElementById('instruction').remove();
        document.getElementById('start').innerHTML='';
        event.preventDefault();
        
        //refreshing speed of the canvas
        var framesPerSecond = 25;
        setInterval(updateAll, 1000 / framesPerSecond);
        
        //tracking the mouse pointer
        canvas.addEventListener("mousemove", updateMousePos);
        blockReset();
        ballRest();
        document.removeEventListener("keydown",()=>{
            console.log('event listener removed');
        });
      document.removeEventListener('keydown',gameStarter);
    }
    

}

function gameRestart() {
    document.getElementById('note').remove();
  document.getElementById("end").innerHTML = "Game over";
  setInterval(() => {
    location.reload();
  }, 2000);
}

//brings the ball to the center
function ballRest() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
}

//creates the blocks after restarting the game
function blockReset() {
  blockCount = 0;
  for (var i = 0; i < columns * rows; i++) {
    blockGrid[i] = true;
    blockCount++;
  }
}

//controls ball movement
function ballMove() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // ballY
  if (ballY > canvas.height) {
    // ballSpeedY = -ballSpeedY;
    gameRestart();
  } else if (ballY < 0 && ballSpeedY < 0.0) {
    ballSpeedY = -ballSpeedY;
  }

  // ballx
  if (ballX > canvas.width && ballSpeedX > 0.0) {
    ballSpeedX = -ballSpeedX;
  } else if (ballX < 0 && ballSpeedX < 0.0) {
    ballSpeedX = -ballSpeedX;
  }
}

//checks if the block is present
function blockChecker(col, row) {
  if (col >= 0 && col < columns && row >= 0 && row < rows) {
    var brickIndexUnderCoord = positionInArray(col, row);
    return blockGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
}

function ballBlockColl() {
  var ballBlockCol = Math.floor(ballX / block_width);
  var ballBlockRow = Math.floor(ballY / blockHeight);
  var brickIndexUnderBall = positionInArray(ballBlockCol, ballBlockRow);
  if (
    ballBlockCol >= 0 &&
    ballBlockCol < columns &&
    ballBlockRow >= 0 &&
    ballBlockRow < rows
  ) {
    if (blockChecker(ballBlockCol, ballBlockRow)) {
      blockGrid[brickIndexUnderBall] = false;
      blockCount--;

      var prevBallX = ballX - ballSpeedX;
      var prevBallY = ballY - ballSpeedY;
      var prevBlockCol = Math.floor(prevBallX / block_width);
      var prevBlockRow = Math.floor(prevBallY / blockHeight);

      var bothTestFailed = true;

      if (prevBlockCol != ballBlockCol) {
        if (blockChecker(prevBlockCol, ballBlockRow) == false) {
          ballSpeedX = -ballSpeedX;
          bothTestFailed = false;
        }
      }

      if (prevBlockRow != ballBlockRow) {
        if (blockChecker(ballBlockCol, prevBlockRow) == false) {
          ballSpeedY = -ballSpeedY;
          bothTestFailed = false;
        }
      }

      if (bothTestFailed) {
        ballSpeedX = -ballSpeedX;
        ballSpeedY = -ballSpeedY;
      }
    }
  }
}

function paddleMove() {
  // paddle
  var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
  var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
  var paddleLeftEdgeX = paddleX;
  var paddleRightEdgeX = paddleX + PADDLE_WIDTH;
  if (
    ballY > paddleTopEdgeY && // top of paddle
    ballY < paddleBottomEdgeY && // bottom of paddle
    ballX > paddleLeftEdgeX && // left half of paddle
    ballX < paddleRightEdgeX // right half of paddle
  ) {
    ballSpeedY = -ballSpeedY;

    var paddleCenterX = paddleX + PADDLE_WIDTH / 2;
    var ballDistFromCenterX = ballX - paddleCenterX;
    ballSpeedX = ballDistFromCenterX * 0.35;

    if (blockCount == 0) {
      blockReset();
    }
  }
}

function movement() {
  ballMove();
  ballBlockColl();
  paddleMove();
}

//updates the screen in interval of 1sec
function updateAll() {
  movement();
  playArea();
}

//updates the mouse position
function updateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;

  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  paddleX = mouseX - PADDLE_WIDTH / 2;

    // //cheat to test ball in any position
    // ballX = mouseX;
    // ballY = mouseY;
    // ballSpeedX = 4;
    // ballSpeedY = -4;
}

//Drawing functions

function playArea() {
  // gameCanvas
  colorRect(0, 0, canvas.width, canvas.height, "white");
  // ball
  colorCircle();
  // paddle
  colorRect(
    paddleX,
    canvas.height - PADDLE_DIST_FROM_EDGE,
    PADDLE_WIDTH,
    PADDLE_THICKNESS,
    "red"
  );
  //blocks
  drawBlocks();
}

function colorRect(leftX, topY, width, height, color) {
  canvasContext.fillStyle = color;
  canvasContext.fillRect(leftX, topY, width, height);
}

function colorText(showWords, textX, textY, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillText(showWords, textX, textY);
}

function positionInArray(col, row) {
  return col + columns * row;
}

function drawBlocks() {
  for (var eachRow = 0; eachRow < rows; eachRow++) {
    for (var eachCol = 0; eachCol < columns; eachCol++) {
      var arrayIndex = positionInArray(eachCol, eachRow);
      if (blockGrid[arrayIndex]) {
        colorRect(
          block_width * eachCol,
          blockHeight * eachRow,
          block_width - blockGap,
          blockHeight - blockGap,
          "blue"
        );
      } //   if brick
    } // each brick
  } // each brickrow
} // drawBlocks

function colorCircle() {
  canvasContext.fillStyle = "black";
  canvasContext.beginPath();
  canvasContext.arc(ballX, ballY, 10, 0, Math.PI * 2, true);
  canvasContext.fill();
}
