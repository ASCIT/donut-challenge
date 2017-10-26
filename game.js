var myFish;
var myFishSpeed = 5;
var myScore = 0;
var mySharkCount = 0;
var goldfishes = [];
var goldfishesInterval = 100;
var sharks = [];
var sharkInterval = 100;
var backgroundPic;
var backgroundSpeed = -2;
var otherFishSpeed = -5;
var bgm;
var eatingSound;
var hitSound;
var countdownImgs = [];
var fightBGM;
var fightSound;
var lightning;
var fightBG;
var cheerSound;
var winImg;
var winText;
var loseImg;
var loseText;
var hurtSound;
var ripMusic;
var gradient;

/* ============================= GAME AREA ================================== */

function startGame() {
    // myFish = new component(30, 30, "red", 10, 120);
	myFish = new component(200, 100, "images/fish.png", 10, 320-100/2, "image", "myFish");
	backgroundPic = new component(1138, 640, "images/ocean.jpg", 0, 0, "background", "background");
	scoreText = new component("30px", "Arial", "black", 800, 40, "text", "score");
	backgroundPic.speedX = backgroundSpeed;
	bgm = new sound("music/adventure_awaits.mp3", true);
	ripMusic = new sound("music/respectfully_resigned.wav", true);
	bgm.play();
	eatingSound = new sound("music/chew.mp3", false);
	hitSound = new sound("music/hit.mp3", false);
    myGameArea.start();
}

function preStartScene() {
	
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1080;
        this.canvas.height = 640;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
		window.addEventListener('keydown', function (e) {
			if (!myGameArea.keys) {
				myGameArea.keys = [];
			}
            myGameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        });
		gradient = this.context.createLinearGradient(0,0,700,0);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

function updateGameArea() {
	// Has myFish eaten a goldfish?
	for (var i=0; i<goldfishes.length; i++) {
		if (fishCrashWith(goldfishes[i])) {
			// myGameArea.stop();
			eatingSound.play();
			goldfishes.splice(i, 1);
			myScore += 10;
			otherFishSpeed *= 1.01;
			goldfishesInterval = Math.round(goldfishesInterval / 1.01);
			sharkInterval = Math.round(sharkInterval / 1.01);
			// console.log(goldfishesInterval);
			break;
		}
	}
	
	// Has myFish run into a shark?
	for (var i=0; i<sharks.length; i++) {
		if (fishCrashWith(sharks[i])) {
		    myGameArea.stop();
			hitSound.play();
			setTimeout(function() {
				bgm.stop();
				mySharkCount++;
				fightShark();
			}, 150);
			return;	
		}
	}
	
	myGameArea.frameNo += 1;
	// myScore increments every 20 frames
	if (myGameArea.frameNo % 20 == 0) {
		myScore += 1;
	}
    myGameArea.clear();
	
	// Update background
	backgroundPic.newPos();
	backgroundPic.update();
	
	
	// Update goldfishes
	if (myGameArea.frameNo == 1 ||
		myGameArea.frameNo % goldfishesInterval == 0) { // make new fishes
		var x = myGameArea.canvas.width;
        var y = Math.floor(Math.random()*(myGameArea.canvas.height - 62));
		newFish = new component(80, 62, "images/goldfish.png", x, y, "image", "food");
		newFish.speedX = otherFishSpeed;
        goldfishes.push(newFish);
	}
	var i=0;
	while (i<goldfishes.length) {
		goldfishes[i].newPos();
		if (goldfishes[i].x + goldfishes[i].width < 0) {
			goldfishes.shift();
		} else {
			goldfishes[i].update();
			i ++;
		}
	}
	
	// Update sharks
	if (myGameArea.frameNo % sharkInterval == 0) { // make new shark
		var x = myGameArea.canvas.width;
        var y = Math.floor(Math.random()*(myGameArea.canvas.height - 200));
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
    if (myGameArea.keys && myGameArea.keys[37]) {move(myFish, "left", myFishSpeed); }
    if (myGameArea.keys && myGameArea.keys[39]) {move(myFish, "right", myFishSpeed); }
    if (myGameArea.keys && myGameArea.keys[38]) {move(myFish, "up", myFishSpeed); }
    if (myGameArea.keys && myGameArea.keys[40]) {move(myFish, "down", myFishSpeed); }
    myFish.newPos();    
    myFish.update();
	// Update score display
	scoreText.text="SCORE: " + myScore;
    scoreText.update();
}

/* === END OF GAME AREA === */


/* ============================ FIGHT SCENE ================================= */

function fightShark() {
	var w = myGameArea.canvas.width;
	var h = myGameArea.canvas.height;
		
	// Enter shark from right
	var width = Math.round(w * 0.4);
	var height = Math.round(width / 1405 * 1231);
	var shark = new component(width, height, "images/sharkhead.png",
	myGameArea.canvas.width, 0, "image", "shark");
	shark.speedX = -12;
	
	// Enter myFish from left
	var height = h * 0.5;
	var width = Math.round(height / 816 * 1816);
	var me = new component(width, height, "images/fish.png",
	-width, 350, "image", "myFish");
	me.speedX = 10;
	
	// Load fight scene components / sounds
	countdownImgs[0] = new component(h/1.7,h/1.7,"images/3.png",w/3.4, h/4, "image");
	countdownImgs[1] = new component(h/1.7,h/1.7,"images/2.png",w/3.4, h/4, "image");
	countdownImgs[2] = new component(h/1.7,h/1.7,"images/1.png",w/3.4, h/4, "image");
	lightning = new component(h/5, h+20, "images/lightning.png", w/2-40, -20, "image");
	fightBGM = new sound("music/fantasy_boss.mp3", true);
	fightSound = new sound("music/attack.mp3", true);
	fightBG = new component(w, h, "black", 0, 0);
	fightBGM.play();
	cheerSound = new sound("music/cheer.mp3", false);
	winImg = new component(300, 169, "images/youwin.jpg", 400, 170, "image");
	gradient.addColorStop("0","magenta");
	gradient.addColorStop("0.4","blue");
	gradient.addColorStop("0.6","red");
	gradient.addColorStop("1.0","yellow");
	winText = new component("30px", "Comic Sans MS", gradient, 300, 390, "text");
	winText.text = "Game will resume in 5 seconds";
	loseImg = new component(300, 169, "images/cry.jpg", 400, 170, "image");
	loseText = new component("30px", "Comic Sans MS", gradient, 300, 390, "text");
	loseText.text = "Game over, press Enter to restart";
	hurtSound = new sound("music/damaged.mp3", true);
	
	myGameArea.interval = setInterval(function() {
		updateFight("sharkEntrance", me, shark, fightBG);
	}, 20);
	
}

function updateFight(scene, me, shark) {
	
	if (scene == "sharkEntrance") {
		myGameArea.clear();
		fightBG.update();
		shark.newPos();
		shark.update();
		if (shark.x+shark.width <= myGameArea.canvas.width) {
			shark.speedX = 0;
			myGameArea.stop();
			myGameArea.interval = setInterval(function() {
				updateFight("myFishEntrance", me, shark, fightBG);
			}, 20);
		}
	} else if (scene == "myFishEntrance") {
		myGameArea.clear();
		fightBG.update();
		shark.update();
		me.newPos();
		me.update();
		if (me.x+me.width >= myGameArea.canvas.width * 0.3) {
			me.speedX = 0;
			myGameArea.stop();
			updateFight("fightOrFlight", me, shark);
		}
	} else if (scene == "fightOrFlight") {
		var sharkline = new component("54px", "Arial Black", "white", 60, 220, "text");
		sharkline.text = "You! I will eat you!";
		var myline1 = new component("36px", "Comic Sans MS", "white", 450, 480, "text");
		myline1.text = "Fight       Not fight";
		var myline2 = new component("20px", "Arial", "white", 450, 520, "text");
		myline2.text = "(press y)                    (press n)";
		// shark.update();
		// me.update();
		sharkline.update();
		myline1.update();
		myline2.update();
		myGameArea.interval = setInterval(function() {
			updateFight("readInput", me, shark);
		}, 20);
	} else if (scene == "readInput") {
		if (myGameArea.keys[89]) {
			// Fight
			myGameArea.frameNo = 0;
			myGameArea.stop();
			myGameArea.interval = setInterval(
				function() {
					updateFight("countdown", me, shark);
				},
			20);
		} else if (myGameArea.keys[78]) {
			// No fight gameover
			gameover();
		}
		
	} else if (scene == "countdown") {
		// shark.update();
		// me.update();
		var n;
		if (myGameArea.frameNo == 0 * 50) {
			n = 0;
		} else if (myGameArea.frameNo == 1 * 50) {
			n = 1;
		} else if (myGameArea.frameNo == 2 * 50) {
			n = 2;
		} else if (myGameArea.frameNo == 3 * 50) {
			n = 3;
		}
		if (n >= 0 && n < 3) { 
			myGameArea.clear();
			fightBG.update();
			countdownImgs[n].update();
		} else if (n == 3) {
			myGameArea.stop();
			var width = myGameArea.canvas.width;
			var height = myGameArea.canvas.height;
			shark.speedX = -50;
			shark.x = width;
			shark.y = 0;
			me.speedX = 40;
			me.x = -Math.round(height / 816 * 1816);
			me.y = 350;
			
			myGameArea.interval = setInterval(
				function() {
					updateFight("fight", me, shark);
				}, 20
			);
		}
		myGameArea.frameNo += 1;
	} else if (scene == "fight") {
		myGameArea.clear();
		fightBG.update();
		shark.newPos();
		shark.update();
		me.newPos();
		me.update();
		lightning.newPos();
		lightning.update();
		var sharkStop = false;
		var meStop = false;
		if (shark.x+shark.width <= myGameArea.canvas.width) {
			shark.speedX = 0;
			sharkStop = true;
		}
		if (me.x+me.width >= myGameArea.canvas.width * 0.3) {
			me.speedX = 0;
			meStop = true;
		}
		if (sharkStop && meStop) {
			myGameArea.stop();
			fightSound.play();
			hurtSound.play();
			var myRandTitle = new component("30px", "Comic Sans MS", "white", 100, 220, "text");
			myRandTitle.text = "Your random number";
			var myRand = new component("50px", "Arial Black", "white", 150, 270, "text");
			myRand.text = Math.ceil(Math.random() * 10);
			var sharkRandTitle = new component("30px", "Comic Sans MS", "white", 650, 480, "text");
			sharkRandTitle.text = "Shark boss's random number";
			var sharkRand = new component("50px", "Arial Black", "white", 800, 530, "text");
			sharkRand.text = Math.ceil(Math.random() * 10);
			// sharkRand.text = 0;
			setTimeout(function() {
				myRandTitle.update();
				myRand.update();
			}, 1500);
			setTimeout(function() {
				sharkRandTitle.update();
				sharkRand.update();
				console.log("shark");
				
			}, 2500);
			setTimeout(function() {
				if (parseInt(myRand.text) > parseInt(sharkRand.text)) { // win
					console.log("win");
					cheerSound.play();
					fightSound.stop();
					hurtSound.stop();
					winImg.update()
					winText.update();
					myFish.x = 10;
					myFish.y = 320-100/2;
					sharks = [];
					goldfishes = [];
					setTimeout(function() {
						myGameArea.interval = setInterval(updateGameArea, 20);
						fightBGM.stop();
						bgm.play();
					}, 5000);
				} else { // lose
					// gameover
					gameover();
				}
			}, 3500);
			
		}
	}
}

function gameover(){
	hurtSound.stop();
	fightSound.stop();
	fightBGM.stop();
	ripMusic.play();
	loseImg.update();
	loseText.update();
	myGameArea.interval = setInterval(restart, 20);
}

function restart() {
	if (myGameArea.keys[13]) {
		myFish.x = 10;
		myFish.y = 320-100/2;
		myScore = 0;
		backgroundPic.speedX = backgroundSpeed;
		bgm.play();
	    myGameArea.stop();
		myGameArea.frameNo = 0;
		sharks = [];
		goldfishes = [];
        myGameArea.interval = setInterval(updateGameArea, 20);
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
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;  
	this.role = role; // "myFish", "background", "food"
    this.update = function() {
        ctx = myGameArea.context;
		if (this.type == "text") {
		      ctx.font = this.width + " " + this.height;
		      ctx.fillStyle = color;
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
            ctx.fillStyle = color;
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
    // myFish.image.src = "angry.gif";
    if (dir == "up") {thing.speedY = -speed; }
    if (dir == "down") {thing.speedY = speed; }
    if (dir == "left") {thing.speedX = -speed; }
    if (dir == "right") {thing.speedX = speed; }
}

function stopMove(thing) {
    // myFish.image.src = "smiley.gif";
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

/* === END OF GAME MUSIC === */

