import * as robot from 'robotjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('r', {
    alias: 'radius',
    type: 'number',
    default: 100,
    describe: 'Radius of the circle',
  })
  .option('s', {
    alias: 'speed',
    type: 'number',
    default: 0.1,
    describe: 'Speed of the mouse',
  })
  .option('w', {
    alias: 'wait',
    type: 'number',
    default: 0.5,
    describe: 'Wait time in seconds between each spin cycle',
  })
  .parseSync();

// Get the center of the screen
const screenSize = robot.getScreenSize();
const centerX = screenSize.width / 2;
const centerY = screenSize.height / 2;

let isProgrammaticMove = false;

// Function to move the mouse in a circle
function moveMouseInCircle() {
  for (let i = 0; i < 360; i += 3) {
    const x = centerX + argv.r * Math.cos((i * Math.PI) / 180);
    const y = centerY + argv.r * Math.sin((i * Math.PI) / 180);
    isProgrammaticMove = true;
    robot.moveMouseSmooth(x, y, argv.s);
    isProgrammaticMove = false;
  }
}

// Function to start the cycle
function startCycle() {
  // Start moving the mouse
  robot.setMouseDelay(argv.s);
  moveMouseInCircle();
}

// Start the cycle
startCycle();

const waitTime = argv.w > 0 ? argv.w : 0.5;

// Repeat the cycle every wait minutes, with a wait time in between
let intervalId = setInterval(() => {
  setTimeout(startCycle, waitTime * 1000);
}, waitTime * 1000);

// Handle CTRL+C
process.on('SIGINT', () => {
  console.log('\nGracefully stopping...');
  clearInterval(intervalId);
  process.exit();
});

// Check for mouse movement
let lastPos = robot.getMousePos();

setInterval(() => {
  let currentPos = robot.getMousePos();
  if (
    !isProgrammaticMove &&
    (currentPos.x !== lastPos.x || currentPos.y !== lastPos.y)
  ) {
    console.log('Mouse moved by user, stopping...');
    clearInterval(intervalId);
    process.exit();
  }
  lastPos = currentPos;
}, 100);