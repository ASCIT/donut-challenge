var myFish;
var myFishSpeed = 5;
var otherFishes = [];
var otherFishesInterval = 300;
var backgroundPic;
var backgroundSpeed = -2;
var otherFishSpeed = -3;
var bgm;

/* ============================= GAME AREA ================================== */

function startGame() {
    // myFish = new component(30, 30, "red", 10, 120);
	myFish = new component(200, 100, "images/fish.png", 10, 320-100/2, "image");
	backgroundPic = new component(1138, 640, "images/ocean.jpg", 0, 0, "background");
	backgroundPic.speedX = backgroundSpeed;
	bgm = new sound("music/adventure_awaits.mp3");
	bgm.play();
    myGameArea.start();
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
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

function updateGameArea() {
	for (var i=0; i<otherFishes.length; i++) {
		if (fishCrashWith(otherFishes[i])) {
			setTimeOut(myGameArea.stop(), 1000);
			// myGameArea.stop();
			break;
		}
	}
	myGameArea.frameNo += 1;
    myGameArea.clear();
	// Update background
	backgroundPic.newPos();
	backgroundPic.update();
	// Update myFish
	myFish.speedX = 0;
	myFish.speedY = 0;
    if (myGameArea.keys && myGameArea.keys[37]) {move(myFish, "left", myFishSpeed); }
    if (myGameArea.keys && myGameArea.keys[39]) {move(myFish, "right", myFishSpeed); }
    if (myGameArea.keys && myGameArea.keys[38]) {move(myFish, "up", myFishSpeed); }
    if (myGameArea.keys && myGameArea.keys[40]) {move(myFish, "down", myFishSpeed); }
    myFish.newPos();    
    myFish.update();
	// Update otherFishes
	if (myGameArea.frameNo == 1 ||
		myGameArea.frameNo % otherFishesInterval == 0) {
		var x = myGameArea.canvas.width;
        var y = Math.floor(Math.random()*(myGameArea.canvas.height - 40)+20);
		newFish = new component(80, 62, "images/goldfish.png", x, y, "image");
		newFish.speedX = otherFishSpeed;
        otherFishes.push(newFish);
		
	}
	var i=0;
	while (i<otherFishes.length) {
		otherFishes[i].newPos();
		if (otherFishes[i].x + otherFishes[i].width < 0) {
			otherFishes.shift();
		} else {
			otherFishes[i].update();
			i ++;
		}
	}
}

/* === END OF GAME AREA === */

/* ============================ GAME PIECES ================================= */

function component(width, height, color, x, y, type) {
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
    this.update = function() {
        ctx = myGameArea.context;
		if (this.type == "image" || type == "background") {
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
	var myLeft = myFish.x;
    var myRight = myFish.x + (myFish.width);
    var myTop = myFish.y;
    var myBottom = myFish.y + (myFish.height);
    var thingLeft = thing.x;
    var thingRight = thing.x + (thing.width);
    var thingTop = thing.y;
    var thingBottom = thing.y + (thing.height);
	
    // if ((myBottom > thingTop) || (myTop > thingBottom) ||
    // 	    (myRight > thingLeft) || (myLeft < thingRight)) {
	if (!((myBottom < thingTop) || (myTop > thingBottom) || (myRight < thingLeft) || (myLeft > thingRight))) {
		 return true;
    }
    return false;
}





/* === END OF GAME PIECES === */

/* ============================ GAME MUSIC ================================== */

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
	if (typeof this.sound.loop == 'boolean') {
	    this.sound.loop = true;
	} else {
	    this.sound.addEventListener('ended', function() {
	        this.sound.currentTime = 0;
	        this.sound.play();
	    }, false);
	}
	this.sound.loop = true;
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

/* === END OF GAME MUSIC === */

