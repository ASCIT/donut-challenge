// A few global variables to make everything quick and easy for such a small application
var game = '';
var interval = '';
var canvas;
var ctx;
// I would really prefer if this were part of the enemy character, but
// it sometimes doesn't play if its in the Enemy object and we try to delete it,
// so I had to hack around it. A little technical debt if I come back to this to 
// clean it up or make it better. In Technical Debt file-- tag **0001.
var enemyDeadSound = ''; 


// Standard Page load. Sets the relevant globals, the handlers, and creates the Game Object
function onLoad(){
    canvas = document.getElementById("game_canvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10pt Arial";

    game = new Game();
    interval = setInterval(function(){game.play();}, 1000 / game.fps);
    document.addEventListener('keydown', function(e){game.keyInput(e);});
    document.addEventListener('click', function(e){game.mouseInput(e);});
    
}

// The object for the looping background music. Fairly straight-forward
function Music(source){
    this.music = document.createElement("audio");
    this.music.src = source;
    this.music.setAttribute("preload", "auto");
    this.music.setAttribute("controls", "none");
    this.music.setAttribute("loop", "true");
    this.music.style.display = "none";
    this.music.volume = .20;
    document.body.appendChild(this.music);
    
    // Plays the music. 
    this.play = function(){
	this.music.setAttribute("loop", "true");
	this.music.play();
    }
    // Pauses the music
    this.pause = function(){
	this.music.setAttribute("loop", "false");
	this.music.pause();
    }
    // Rather than making a new Music object for every time we switch songs, 
    // just change the song. 
    this.setSource = function(source){
	this.music.setAttribute("loop", "true");
	this.music.src = source;
    }
    // Increases the music volume
    this.raiseVolume = function(){
	if(this.music.volume < 1){
	    this.music.volume += .05;
	}
    }
    // Decreases the music volume
    this.lowerVolume = function(){
	if(this.music.volume > 0){
	    this.music.volume -= .05;
	} 
    }
}

// The Object for non-looping sound. 
function Sound(source, className = "none"){
    // I don't usually use JavaScript for OOP type programming. 
    // Usually just scripting. My hack at the DRY principle. 
    // See technical debt **0002. 
    this.sound = new Music(source);
    this.sound.music.removeAttribute("loop");
    this.sound.music.setAttribute("class", className);
    // Plays the sound
    this.play = function(){
	this.sound.music.pause();
	this.sound.music.play();
    }
    // Pauses the sound
    this.pause = function(){
	this.sound.pause();
    }
    // Rather than creating a new Object for every new Sound, 
    // we can just change the source.
    this.setSource = function(source){
	this.sound.src = source;
    }
}
    

// The Object for the enemies. Can easily be modified to have pictures instead of just squares
function Enemy(human_posx, human_posy, size = Math.random() * 60, velx, vely, hp){
    this.size = size;
    this.velx = velx; this.vely = vely;
    this.posx = human_posx - 500 * this.velx;
    this.posy = human_posy - 500 * this.vely;
    this.hp = hp;
    this.dead = false;

    // Sound Source Paths
    this.baseSoundDir = "./music/";
    this.deadSoundSource = this.baseSoundDir + "cheer.mp3";

    // Sound -- A bit of a hacky work-around. See technical debt **0001.
    if(enemyDeadSound == ''){
	enemyDeadSound = new Sound(this.deadSoundSource, "cheers");
    }
    this.deadSound = enemyDeadSound;

    // Decrements the health by 1.
    this.damage = function(){
	this.hp -= 1;
    }
    // Boolean return whether the Enemy is dead or not. 
    this.isDead = function(){
	if(this.dead == true){
	    return true;
	} else{
	    return false;
	}
    }
    // Boolean return for whether or not a pixel is inside the Enemy 
    // Used for determining collisions. Naive, but it works for this particular game.
    this.isInside = function(x, y){
	var lbx = this.posx; var hbx = lbx + this.size;
	var lby = this.posy; var hby = lby + this.size;
	
	if(x >= lbx && x <= hbx && y >= lby && y <= hby){
	    return true;
	} else {
	    return false;
	}
    }
    // Updates Enemy states on every Game loop
    this.updateState = function(){
	this.posx += this.velx;
	this.posy += this.vely;
	if(this.hp <= 0){
	    this.dead = true;
	    this.deadSound.play();
	}
    }
    // Renders the Enemy to the Global canvas.
    this.render = function(){
	ctx.fillStyle = "red";
	ctx.fillRect(this.posx, this.posy, this.size, this.size);
	ctx.fillStyle = "white";
    }
    // Deletes the enemy and its associated sounds. 
    this.del = function(){
	var child = document.getElementsByClassName("cheers")[0];
	var parent = document.getElementsByTagName("body")[0];
	parent.removeChild(child);
    }
}
	

// The Object for the Player herself. 
function Character(){
    // Image Source Paths
    this.baseImgDir = "./images/";
    this.fullHeartSource = this.baseImgDir + "full_heart.png";
    this.emptyHeartSource = this.baseImgDir + "empty_heart.png";
    this.standingSource = this.baseImgDir + "player_standing.png";
    this.slashingSource = this.baseImgDir + "player_slashing.png";
    this.walkingSource = this.baseImgDir + "player_walking.png";
    // Sound Source Paths
    this.baseSoundDir = "./music/";
    this.attackSource = this.baseSoundDir + "attack.mp3";
    this.damageSource = this.baseSoundDir + "damaged.mp3";
    // Preemptive image setup
    this.heartImage = document.createElement("img");
    this.heartImage.setAttribute("src", this.heartImageSource);
    this.image = document.createElement("img");
    this.image.setAttribute("src", this.standingSource);

    // Animation and State
    this.animationCounter = 0;
    this.state = "standing";

    // Character Values
    this.posx = 0; this.posy = canvas.height / 2;
    this.velx = 0; this.vely = 0;
    this.hp = 3;

    // Sound
    this.attackSound = new Sound(this.attackSource, "slashSound");
    this.damageSound = new Sound(this.damageSource, "damageSound");
    
    // Movement Functions (move, accelerate, decelerate)
    this.incrementVarWithBounds = function(varName, lbound, hbound){
	return function increment(mag){
	    if(this[varName] + mag <= hbound && this[varName] + mag >= lbound){
		this[varName] += mag;
	    } else if(this[varName] + mag < lbound){
		this[varName] = lbound;
	    } else {
		this[varName] = hbound;
	    }
	}
    }
    var velocity_bound = 2;
    var xcorrection = 13; //for bounding the edge with the actual picture size vs image size
    this.accX = this.incrementVarWithBounds("velx", -velocity_bound, velocity_bound);
    this.accY = this.incrementVarWithBounds("vely", -velocity_bound, velocity_bound);
    this.moveX = this.incrementVarWithBounds("posx", -xcorrection, canvas.width - this.image.width + xcorrection);
    this.moveY = this.incrementVarWithBounds("posy", 0, canvas.height - this.image.height);

    this.decrementVarTowardsZero = function(varName){
	return function dec(mag){
	    mag = Math.abs(mag);
	    if(this[varName] > mag){
		this[varName] -= mag;
	    } else if(this[varName] < -mag){
		this[varName] += mag;
	    } else{
		this[varName] = 0;
	    }
	}
    }
    this.decX = this.decrementVarTowardsZero("velx");
    this.decY = this.decrementVarTowardsZero("vely");

    //Interfacing
    this.attack = function(){
	this.attackSound.play();
	this.changeState("slashing");
    }
    this.damage = function(){
	this.damageSound.play();
	this.hp -= 1;
    }
    this.isState = function(state){
	return function(){
	    if(this.state == state){
		return true;
	    } else {
		return false;
	    }
	}
    }
    this.isDead = this.isState("dead");
    this.isSlashing = this.isState("slashing");

    // Boolean return for whether or not a square collides with the Character
    this.collides = function(lbx, hbx, lby, hby){
	//image errors -- the difference between the actual character sprite and the image size
	var xerror = 13; var yerror = 0;
	var playerLBX = this.posx + xerror; var playerHBX = this.posx + this.image.width - xerror; 
	var playerLBY = this.posy + yerror; var playerHBY = this.posy + this.image.height - yerror; 
	if(lbx >= playerLBX && lbx <= playerHBX && lby >= playerLBY && lbx <= playerHBY){
	    return true;
	} else if (lbx >= playerLBX && lbx <= playerHBX && hby >= playerLBY && hby <= playerHBY){
	    return true;
	} else if (hbx >= playerLBX && hbx <= playerHBX && lby >= playerLBY && lby <= playerHBY){
	    return true;
	} else if (hbx >= playerLBX && hbx <= playerHBX && hby >= playerLBY && hby <= playerHBY){
	    return true;
	} else if(playerLBX >= lbx && playerLBX <= hbx && playerLBY >= lby && playerLBY <= hby){
	    return true;
	} else if(playerHBX >= lbx && playerHBX <= hbx && playerLBY >= lby && playerLBY <= hby){
	    return true;
	} else if(playerLBX >= lbx && playerLBX <= hbx && playerHBY >= lby && playerHBY <= hby){
	    return true;
	} else if(playerHBX >= lbx && playerHBX <= hbx && playerHBY >= lby && playerHBY <= hby){
	    return true;
	} else {
	    return false;
	}
    }
	    
    // Renders the character and her health to the global canvas.
    this.render = function(){
	if(this.state == "standing"){
	    this.image.setAttribute("src", this.standingSource);
	} else if(this.state == "slashing"){
	    this.image.setAttribute("src", this.slashingSource);
	} else if(this.state == "walking"){
	    this.image.setAttribute("src", this.walkingSource);
	}

	ctx.drawImage(this.image, Math.floor(this.posx), Math.floor(this.posy));
	//Render Hearts
	if(this.hp == 0){
	    return;
	} else if(this.hp == 1){
	    this.heartImage.setAttribute("src", this.fullHeartSource);
	    ctx.drawImage(this.heartImage, 0, 0);
	    this.heartImage.setAttribute("src", this.emptyHeartSource);
	    ctx.drawImage(this.heartImage, this.heartImage.width, 0);
	    ctx.drawImage(this.heartImage, this.heartImage.width * 2, 0);
	} else if(this.hp == 2){
	    this.heartImage.setAttribute("src", this.fullHeartSource);
	    ctx.drawImage(this.heartImage, 0, 0);
	    ctx.drawImage(this.heartImage, this.heartImage.width, 0);
	    this.heartImage.setAttribute("src", this.emptyHeartSource);
	    ctx.drawImage(this.heartImage, this.heartImage.width*2, 0);
	} else if(this.hp == 3){
	    this.heartImage.setAttribute("src", this.fullHeartSource);
	    ctx.drawImage(this.heartImage, 0, 0);
	    ctx.drawImage(this.heartImage, this.heartImage.width, 0);
	    ctx.drawImage(this.heartImage, this.heartImage.width * 2, 0);
	}
    }

    // State Functions 
    this.changeState = function(state){
	this.state = state;
    }
    // Updates the Character states every turn. 
    this.updateState = function(){

	if(this.hp <= 0){
	    this.state = "dead";
	    return;
	}

	var deceleration = .1;
	this.decX(deceleration);
	this.decY(deceleration);
	this.moveX(this.velx);
	this.moveY(this.vely);
	if(this.state == "slashing" && this.animationCounter < 8){
	    this.animationCounter += 1;
	} else if(this.state == "slashing" && this.animationCounter >= 4){
	    this.changeState("standing");
	    this.animationCounter = 0;
	} else if(this.state == "walking" && this.velx == 0 && this.vely == 0){
	    this.changeState("standing");
	} else if(this.state == "walking" && this.animationCounter < 8  && (this.velx != 0 || this.vely != 0)){
	    this.animationCounter += 1;
	} else if(this.state == "walking" && this.animationCounter >= 8){
	    this.animationCounter = 0;
	    this.changeState("standing");
	} else if(this.state == "standing" && this.velx == 0 && this.vely == 0){
	} else if(this.state == "standing" && this.animationCounter < 8 && (this.velx != 0 || this.vely != 0)){
	    this.animationCounter += 1;
	} else if(this.state == "standing" && this.animationCounter >= 8 && (this.velx != 0 || this.vely != 0)){
	    this.animationCounter = 0;
	    this.changeState("walking");
	}  else{
	    this.changeState(this.state);
	}
    }
}






// The Game Object
function Game(){
    //Sound Source Paths
    this.baseSoundDir = "./music/";
    this.fightSource = this.baseSoundDir + "adventure_awaits.mp3";
    this.menuSource = this.baseSoundDir + "fantasy_town.mp3";
    this.bossSource = this.baseSoundDir + "fantasy_boss.mp3";
    this.gameOverSource = this.baseSoundDir + "respectfully_resigned.wav";
  
    // Game States and variables. 
    this.gameState = "start menu";
    this.fps = 30;
    this.enemiesRate = 1 / 50;
    this.background = new Music('');
    this.player = new Character();
    this.enemies = [];
    this.enemiesGenerated = 0;
    this.enemiesTotal = 10;
    this.musicChanged = true;
    
    // Changes the gameState variable and sets a flag to change music.
    this.changeState = function(state){
	this.gameState = state;
	this.musicChanged = true;
    }
    // Chooses the music based on the gameState.
    this.chooseMusic = function(state){
	var newMusic = "";
	if(state == "start menu" || state == "pause menu"){
	    newMusic = this.menuSource;
	} else if (state == "adventure"){
	    newMusic = this.fightSource;
	} else if (state == "boss"){
	    newMusic = this.bossSource;
	} else if (state == "game over"){
	    newMusic = this.gameOverSource;
	} else if (state == "victory"){
	    newMusic = this.menuSource;
	}
	return newMusic;
    }
    
    // The Game loop!
    this.play = function(){
	var randNum = Math.random();
	// Logic
	if(this.player.isDead() && this.gameState != "game over"){
	    this.changeState("game over");
	} else if(this.enemiesGenerated == this.enemiesTotal && this.enemies.length == 0){
	    this.changeState("boss");
	    var bossHealth = 150;
	    var bossVelX = -1;
	    var bossVelY = 0;
	    var boss = new Enemy(0, 0, 500, bossVelX, bossVelY, bossHealth);
	    this.enemies.push(boss);
	    this.enemiesGenerated += 1;
	} else if(this.gameState == "boss" && this.enemies.length == 0){
	    this.changeState("victory");
	}
	if(this.musicChanged){
	    this.background.pause();
	    this.background.setSource(this.chooseMusic(this.gameState));
	    this.background.play();
	    this.musicChanged = false;
	}
	if(randNum <= this.enemiesRate && this.enemiesGenerated < this.enemiesTotal){
	    var littleHp = 1;
	    var randSize = Math.random() * 75;
	    var randVelx = -.5 + Math.random() * -7;
	    var randVely = Math.random() * 1;
	    if(Math.random() <= .5){
		randVely *= -1;
	    }
	    var enemy = new Enemy(this.player.posx, this.player.posy, randSize, randVelx, randVely, littleHp)
	    this.enemies.push(enemy);
	    this.enemiesGenerated += 1;
	}
	if(this.gameState == "adventure" || this.gameState == "boss"){
	    // Collision Detection
	    for(var i = 0; i < this.enemies.length; i++){
		//Enemy bounds
		var enemy = this.enemies[i];
		enemyLBX = enemy.posx; enemyHBX = enemy.posx + enemy.size;
		enemyLBY = enemy.posy; enemyHBY = enemy.posy + enemy.size;
		//Player bounds
		var swordTipX = this.player.posx + this.player.image.width;
		var swordTipY = this.player.posy + this.player.image.height * .5;
		
		var collision = false;
		if(this.player.isSlashing() && enemy.isInside(swordTipX, swordTipY)){
		    enemy.damage();
		}
		if(this.player.collides(enemyLBX, enemyHBX, enemyLBY, enemyHBY)){
		    this.player.damage();
		    enemy.damage();
		}
	    }
	}
	// Render
	var toDelete = [];
	if(this.gameState == "adventure" || this.gameState == "boss"){
	    this.player.updateState();
	    for(var i = 0; i < this.enemies.length; i++){
		this.enemies[i].updateState();
	    }
	    //Clear 
	    ctx.fillRect(0,0,canvas.width, canvas.height);
	    //Render
	    this.player.render();
	    for(var i = 0; i < this.enemies.length; i++){
		this.enemies[i].render();
		if(this.enemies[i].posx <= -this.enemies[i].size){
		    toDelete.push(i);
		} else if (this.enemies[i].isDead()){
		    toDelete.push(i);
		}
	    }
	} else if (this.gameState == "game over"){
	    ctx.fillStyle = "DarkRed";
	    ctx.fillRect(0,0,canvas.width, canvas.height);
	    ctx.fillStyle = "white";
	    ctx.fillText("Game Over. You died.", 10, 20);
	    ctx.fillText("R to restart.", 10, 35);
	} else if(this.gameState == "pause menu"){
	    ctx.fillStyle = "white";
	    ctx.fillRect(0,0, canvas.width, canvas.height);
	    ctx.fillStyle = "black";
	    ctx.fillText("Paused!", 10, 20);
	    ctx.fillText("Space bar to Continue!", 10, 35);
	    ctx.fillText("R to restart!", 10, 50);
	    ctx.fillStyle = "white";
	} else if(this.gameState == "start menu"){
	    ctx.fillStyle = "white";
	    ctx.fillRect(0,0, canvas.width, canvas.height);
	    ctx.fillStyle = "black";
	    ctx.fillText("Welcome to the Game.", 10, 20);
	    ctx.fillText("Space bar to Continue.", 10, 35);
	    ctx.fillText("Space bar to slash while in game.", 10, 50);
	    ctx.fillText("Survive 10 enemies and the boss.", 10, 75);
	    ctx.fillText("Don't die. Good luck", 10, 90);
	    ctx.fillStyle = "white";
	} else if(this.gameState == "victory"){
	    ctx.fillRect(0,0, canvas.width, canvas.height);
	    ctx.fillStyle = "black";
	    ctx.fillText("Good job. You won!", 10, 20);
	    ctx.fillText("R to restart", 10, 35);
	    ctx.fillStyle = "white";
	}
	for(var i = 0; i < toDelete.length; i++){
	    //this.enemies[i].del();
	    this.enemies.splice(toDelete[i], 1);
	}	
    }
    // Sets the game to its initial configuration
    this.restart = function(){
	this.enemies = [];
	this.enemiesGenerated = 0;
	this.changeState("start menu");
	delete this.player;
	this.player = new Character();
    }
    // The key input event handler.
    this.keyInput = function(e){
	if(this.gameState == "adventure" || this.gameState == "boss"){
	    switch(e.which){
		//Volume Control
	    case 109:
		//- key, numpad
	    case 173:
		//_- key
		this.background.lowerVolume();
		break;
	    case 61:
		//+= key
	    case 107:
		//+ key
		this.background.raiseVolume();
		break;
		
		//Pause
	    case 80:
		this.changeState("pause menu");
		break;


		//Player Control
	    case 32:
		//Space Bar
		this.player.attack();
		break;
	    case 37:
		//Left Arrow
		this.player.accX(-2);
		break;
	    case 38:
		//Up Arrow
		this.player.accY(-2);
		break;
	    case 39:
		//Right Arrow
		this.player.accX(2);
		break;
	    case 40:
		//Down Arrow
		this.player.accY(2);
		break;
 	    default: return;
	    }
	} else if(this.gameState == "pause menu"){
	    switch(e.which){
            //space bar continue
	    case 32:
		this.changeState("adventure");
		break;
	    //R for restart
	    case 82:
		this.restart();
		break;
	    }
	} else if(this.gameState == "start menu"){
	    switch(e.which){
		//space bar
	        case 32:
		  this.changeState("adventure");
		  break;
	    }
	} else if(this.gameState == "game over" || this.gameState == "victory"){
	    switch(e.which){
	        case 82:
		//R for restart
		  this.restart();
		  break;
	    }
	}
	e.defaultPrevented = true;
    }
    // The mouse click event handler.
    this.mouseInput = function(e){
	if(!e.hasOwnProperty("offsetX")){
	    e.offsetX = e.layerX - e.currentTarget.offsetLeft;
	    e.offsetY = e.layerY - e.currentTarget.offsetTop;
	}
	var mouseX = e.offsetX;
	var mouseY = e.offsetY;
	
	if(e.target.id == "vol_up_button"){
	    this.background.raiseVolume();
	}
	else if(e.target.id == "vol_down_button"){
	    this.background.lowerVolume();
	}
    }
}
