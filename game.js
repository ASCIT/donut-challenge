// Canvas parameters
var canvas;
var ctx;
const H = 640;
const W = 1080;

// Fishes
var myScore = 0;
var myFish;
var myFishSpeed = 7;
var myFightFish;             // myFish avatar in fight scene
var goldfishes = [];
var goldfishesInterval = 70; // decreases (when a goldfish is eaten)
var sharks = [];
var fightShark;              // shark avatar in fight scene
var sharkInterval = 130;     // decreases (when a goldfish is eaten)
var otherFishSpeed = -6;     // increases (when a goldfish is eaten)
var backgroundSpeed = -2;

// Dynamic game control
var keys = [];
var frameNo = 0;
var frameInterval;

// Components: music
var bgm;
var bgm1;
var bgm2;
var fightBGM;
var ripMusic;

// Components: soundtrack
var eatingSound;
var hitSound;
var attackSound;
var cheerSound;
var hurtSound;

// Components: image
var backgroundPic;
var countdownImgs = [];
var lightning;
var fightBackground;
var winImg;
var loseImg;

// Components: text
var scoreText;
var sharkWords;
var myWords1;
var myWords2;
var winText;
var loseText;
var myRandTitle;
var myRand;
var sharkRandTitle;
var sharkRand;
var gradient;



function startGame() {
	initialize();
	playBGM();
	frameInterval = setInterval(updateGameArea, 20);
}

function initialize() {
	canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
	ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);

	window.addEventListener('keydown', function (e) {
        keys[e.keyCode] = true;
    });
    window.addEventListener('keyup', function (e) {
        keys[e.keyCode] = false;
    });
	
	// Normal game components
	myFish = new component(
		200, 100, "images/fish.png", 10, 320-100/2, "image");
	backgroundPic = new component(
		1138, 640, "images/ocean.jpg", 0, 0, "background");
	scoreText = new component(
		"30px", "Arial Black", "white", 40, 40, "text");
	backgroundPic.speedX = backgroundSpeed;
	
	bgm1 = new sound("music/adventure_awaits.mp3", true);
	bgm2 = new sound("music/fantasy_town.mp3", true);
	ripMusic = new sound("music/respectfully_resigned.wav", true);
	eatingSound = new sound("music/chew.mp3", false);
	hitSound = new sound("music/hit.mp3", false);
	
	// Fight scene components
	gradient = ctx.createLinearGradient(0,0,700,0); // color to match comic sans
	gradient.addColorStop("0","magenta");
	gradient.addColorStop("0.4","blue");
	gradient.addColorStop("0.6","red");
	gradient.addColorStop("1.0","yellow");
	
	var height = H * 0.5;
	var width = Math.round(height / 816 * 1816);
	myFightFish = new component(
		width, height, "images/fish.png", -width, 350, "image");
	width = Math.round(W * 0.4);
	height = Math.round(width / 1405 * 1231);
	fightShark = new component(
		width, height, "images/sharkhead.png", W, 0, "image", "shark");

	fightBackground = new component(W, H, "black", 0, 0); // a black rectangle
	sharkWords = new component("54px", "Arial Black", "white", 60, 220, "text");
	sharkWords.text = "You! I will eat you!";
	myWords1 = new component("36px", "Comic Sans MS", "white", 450, 480, "text");
	myWords1.text = "Fight       Not fight";
	myWords2 = new component("20px", "Arial", "white", 450, 520, "text");
	myWords2.text = "(press y)                    (press n)";
	countdownImgs[0] = new component(
		H/1.7, H/1.7, "images/3.png", W/3.4, H/4, "image");
	countdownImgs[1] = new component(
		H/1.7, H/1.7, "images/2.png", W/3.4, H/4, "image");
	countdownImgs[2] = new component(
		H/1.7, H/1.7, "images/1.png", W/3.4, H/4, "image");
	lightning = new component(
		H/5, H+20, "images/lightning.png", W/2-40, -20, "image");
	winImg = new component(
		300, 169, "images/youwin.jpg", 400, 170, "image");
	winText = new component(
		"30px", "Comic Sans MS", gradient, 290, 390, "text");
	winText.text = "Game will resume in 5 seconds";
	loseImg = new component(
		300, 169, "images/cry.jpg", 400, 170, "image");
	loseText = new component(
		"30px", "Comic Sans MS", gradient, 300, 390, "text");
	loseText.text = "Game over, press Enter to restart";
	myRandTitle = new component("30px", "Comic Sans MS", "white", 100, 220, "text");
	myRandTitle.text = "Your random number";
	myRand = new component("50px", "Arial Black", "white", 150, 270, "text");
	sharkRandTitle = new component("30px", "Comic Sans MS", "white", 650, 480, "text");
	sharkRandTitle.text = "Shark boss's random number";
	sharkRand = new component("50px", "Arial Black", "white", 800, 530, "text");
	
	fightBGM = new sound("music/fantasy_boss.mp3", true);
	attackSound = new sound("music/attack.mp3", true);
	cheerSound = new sound("music/cheer.mp3", false);
	hurtSound = new sound("music/damaged.mp3", true);
	
}

function clearScreen() {
	ctx.clearRect(0, 0, W, canvas.height);
}

/* ============================= GAME AREA ================================== */

function updateGameArea() {
	frameNo += 1;
	
	// Has myFish crossed a bound?
	var myLeft = myFish.x + 0.07 * myFish.width;
    var myRight = myFish.x + 0.93 * myFish.width;
    var myTop = myFish.y + 0.07 * myFish.height;
    var myBottom = myFish.y + 0.93 * myFish.height;
	if (myLeft < 0 || myRight > W || myTop < 0 || myBottom > H) {
		gameover();
		return;
	}
	
	
	// Has myFish eaten a goldfish?
	for (var i=0; i<goldfishes.length; i++) {
		if (fishCrashWith(goldfishes[i])) {
			eatingSound.play();
			goldfishes.splice(i, 1);
			myScore += 10;
			otherFishSpeed *= 1.03;
			goldfishesInterval = Math.round(goldfishesInterval / 1.03);
			sharkInterval = Math.round(sharkInterval / 1.03);
			break;
		}
	}
	
	// Has myFish run into a shark?
	for (var i=0; i<sharks.length; i++) {
		if (fishCrashWith(sharks[i])) {
		    clearInterval(frameInterval);
			hitSound.play();
			bgm.stop();
			startFight();
			return;	
		}
	}
	
	// myScore increments every 20 frames
	if (frameNo % 20 == 0) {
		myScore += 1;
	}
	
	// Start loading components on a blank screen
    clearScreen();
	
	// Update background
	backgroundPic.newPos();
	backgroundPic.update();
	
	
	// Update goldfishes
	if (frameNo == 1 ||
		frameNo % goldfishesInterval == 0) { // make new fishes
		var x = W;
        var y = Math.floor(Math.random()*(canvas.height - 62));
		newFish = new component(80, 62, "images/goldfish.png", x, y, "image");
		newFish.speedX = otherFishSpeed;
        goldfishes.push(newFish);
	}
	var i=0;
	while (i < goldfishes.length) {
		goldfishes[i].newPos();
		if (goldfishes[i].x + goldfishes[i].width < 0) {
			goldfishes.shift();
		} else {
			goldfishes[i].update();
			i ++;
		}
	}
	
	// Update sharks
	if (frameNo % sharkInterval == 0) { // make new shark
		var x = W;
        var y = Math.floor(Math.random()*(canvas.height - 200));
		newFish = new component(200, 264, "images/leftshark.png", x, y, "image", "shark");
		newFish.speedX = otherFishSpeed;
        sharks.push(newFish);
	}
	var i=0;
	while (i<sharks.length) {
		sharks[i].newPos();
		if (sharks[i].x + sharks[i].width < 0) {
			sharks.shift();
		} else {
			sharks[i].update();
			i ++;
		}
	}
	
	// Update myFish
	myFish.speedX = 0;
	myFish.speedY = 0;
    if (keys && keys[37]) {move(myFish, "left", myFishSpeed); }
    if (keys && keys[39]) {move(myFish, "right", myFishSpeed); }
    if (keys && keys[38]) {move(myFish, "up", myFishSpeed); }
    if (keys && keys[40]) {move(myFish, "down", myFishSpeed); }
    myFish.newPos();    
    myFish.update();
	
	// Update score display
	scoreText.text="SCORE: " + myScore;
    scoreText.update();
}

/* === END OF GAME AREA === */


/* ============================ FIGHT SCENE ================================= */

function startFight() {
	
	// Set up fight scene intro
	fightShark.speedX = -12;
	myFightFish.speedX = 10;
	
	// Start fighting background music
	fightBGM.sound.currentTime = 0;
	fightBGM.play();
	
	// Switch to fight scene
	frameInterval = setInterval(function() {
		updateFight("sharkEntrance", myFightFish, fightShark);
	}, 20);
	
}

function updateFight(scene) {
	
	if (scene == "sharkEntrance") {                    // repeated
		clearScreen();
		fightBackground.update();
		fightShark.newPos();
		fightShark.update();
		// After shark arrives
		if (fightShark.x+fightShark.width <= W) {
			fightShark.speedX = 0;
			clearInterval(frameInterval);
			frameInterval = setInterval(function() {
				updateFight("myFishEntrance");
			}, 20);
		}
	} else if (scene == "myFishEntrance") {            // repeated
		clearScreen();
		fightBackground.update();
		fightShark.update();
		myFightFish.newPos();
		myFightFish.update();
		// After myFightFish arrives
		if (myFightFish.x+myFightFish.width >= W * 0.3) {
			myFightFish.speedX = 0;
			sharkWords.update();
			myWords1.update();
			myWords2.update();
			clearInterval(frameInterval);
			updateFight("fightOrFlight");
			frameInterval = setInterval(function() {
				updateFight("fightOrFlight");
			}, 20);
		}
	} else if (scene == "fightOrFlight") {             // repeated
		if (keys[89]) {
			// Fight
			frameNo = 0;
			clearInterval(frameInterval);
			frameInterval = setInterval(
				function() {
					updateFight("countdown");
				},
			20);
		} else if (keys[78]) {
			// No fight gameover
			gameover();
		}
		
	} else if (scene == "countdown") {                  // repeated
		var n;
		if (frameNo == 0 * 50) {
			n = 0;
		} else if (frameNo == 1 * 50) {
			n = 1;
		} else if (frameNo == 2 * 50) {
			n = 2;
		} else if (frameNo == 3 * 50) {
			n = 3;
		}
		if (n >= 0 && n < 3) { 
			clearScreen();
			fightBackground.update();
			countdownImgs[n].update();
		} else if (n == 3) {
			clearInterval(frameInterval);
			var width = W;
			var height = canvas.height;
			fightShark.speedX = -50;
			fightShark.x = width;
			fightShark.y = 0;
			myFightFish.speedX = 40;
			myFightFish.x = -Math.round(height / 816 * 1816);
			myFightFish.y = 350;
			
			frameInterval = setInterval(
				function() {
					updateFight("fight");
				}, 20
			);
		}
		frameNo += 1;
	} else if (scene == "fight") {                        // repeated
		clearScreen();
		fightBackground.update();
		// Entrance
		fightShark.newPos();
		fightShark.update();
		myFightFish.newPos();
		myFightFish.update();
		lightning.newPos();
		lightning.update();
		var sharkStop = false;
		var myFightFishStop = false;
		if (fightShark.x+fightShark.width <= W) {
			fightShark.speedX = 0;
			sharkStop = true;
		}
		if (myFightFish.x+myFightFish.width >= W * 0.3) {
			myFightFish.speedX = 0;
			myFightFishStop = true;
		}
		// Fight actions
		if (sharkStop && myFightFishStop) {
			clearInterval(frameInterval);
			attackSound.play();
			hurtSound.play();
			myRand.text = Math.ceil(Math.random() * 10);
			sharkRand.text = Math.ceil(Math.random() * 10);
			
			// Show random numbers as scores
			setTimeout(function() {
				myRandTitle.update();
				myRand.update();
			}, 1500);
			setTimeout(function() {
				sharkRandTitle.update();
				sharkRand.update();
				
			}, 2500);
			
			// Reveal result
			setTimeout(function() {
				if (parseInt(myRand.text) > parseInt(sharkRand.text)) { // win
					cheerSound.play();
					attackSound.stop();
					hurtSound.stop();
					winImg.update()
					winText.update();
					myFish.x = 10;
					myFish.y = 320-100/2;
					sharks = [];
					goldfishes = [];
					setTimeout(function() {
						frameInterval = setInterval(updateGameArea, 20);
						fightBGM.stop();
						playBGM();
					}, 5000);
				} else { // gameover
					gameover();
				}
			}, 3500);
			
		}
	}
}

function gameover(){

	clearInterval(frameInterval);
	
	hurtSound.stop();
	attackSound.stop();
	bgm.stop();
	fightBGM.stop();
	
	ripMusic.sound.currentTime = 0;
	ripMusic.play();
	
	loseImg.update();
	loseText.update();
	scoreText.update();
	frameInterval = setInterval(restart, 20);
}

function restart() {
	if (keys[13]) {
		myFish.x = 10;
		myFish.y = 320-100/2;
		myScore = 0;
		otherFishSpeed = -5;
		goldfishesInterval = 80;
		sharkInterval = 150;
		backgroundPic.speedX = backgroundSpeed;
		fightBGM.stop();
		ripMusic.stop();
		playBGM();
	    clearInterval(frameInterval);
		frameNo = 0;
		sharks = [];
		goldfishes = [];
        frameInterval = setInterval(updateGameArea, 20);
	}
}

/* === END OF FIGHT SCENE === */


/* ============================ GAME PIECES ================================= */

function component(width, height, color, x, y, type, role) {
	this.type = type;
    if (type == "image" || type == "background") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;  
	this.color = color;
	this.role = role; // "myFish", "background", "food"
    this.update = function() {
		if (this.type == "text") {
		      ctx.font = this.width + " " + this.height;
		      ctx.fillStyle = this.color;
		      ctx.fillText(this.text, this.x, this.y);
		} else if (this.type == "image" || type == "background") {
            ctx.drawImage(this.image, 
                this.x, 
                this.y,
                this.width, this.height);
			if (type == "background") {
                ctx.drawImage(this.image,
                this.x + this.width, this.y, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
		if (this.type == "background") {
            if (this.x == -(this.width)) {
                this.x = 0;
            }
        }     
    }
}

function move(thing, dir, speed) {
    if (dir == "up") {thing.speedY = -speed; }
    if (dir == "down") {thing.speedY = speed; }
    if (dir == "left") {thing.speedX = -speed; }
    if (dir == "right") {thing.speedX = speed; }
}

function stopMove(thing) {
    thing.speedX = 0; 
    thing.speedY = 0; 

}

function fishCrashWith(thing) {
	var myLeft = myFish.x + 0.5 * myFish.width;
    var myRight = myFish.x + (myFish.width) - 10;
    var myTop = myFish.y + 0.1 * myFish.height;
    var myBottom = myFish.y + (myFish.height) - 10;
	if (thing.role == "shark") {
		var thingLeft = thing.x + 0.15 * thing.width;
		var thingRight = thing.x + 0.85 * (thing.width);
	    var thingTop = thing.y + 0.2 * thing.height;
	    var thingBottom = thing.y + 0.85 * (thing.height);
	} else {
		var thingLeft = thing.x;
		var thingRight = thing.x + (thing.width);
	    var thingTop = thing.y;
	    var thingBottom = thing.y + (thing.height);
	}
	
	if ((myBottom < thingTop) || (myTop > thingBottom) || (myRight < thingLeft) || (myLeft > thingRight)) {
		 return false;
    }
    return true;
}
/* === END OF GAME PIECES === */



/* ============================ GAME MUSIC ================================== */

function sound(src, loop) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
	if (loop) {
		if (typeof this.sound.loop == 'boolean') {
		    this.sound.loop = true;
		} else {
		    this.sound.addEventListener('ended', function() {
		        this.sound.currentTime = 0;
		        this.sound.play();
		    }, false);
		}
	}
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

function playBGM() {
	// Switch between the two background music based on random number
	if (Math.random() < 0.5) {
		// Play bgm1
		bgm = bgm1;
	} else {
		// Play bgm2
		bgm = bgm2;
	}
	bgm.sound.currentTime = 0;
	bgm.play();
}

/* === END OF GAME MUSIC === */

