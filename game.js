//The answer to life, the universe, and everything.
const MAX_LEVEL = 42;

/*
    The object for constructing tiles for creating the map.
    x (int): X position
    y (int): Y position
    tile_image (int): Specifies what type of tile it is.
    walkable (bool): Can the player and enemies walk on it?
    trap (bool): Is this tile a secret trap for the player?
    loot (bool): Does this tile have an item on it?
*/
function Tile (x, y, tile_image, walkable, trap, loot) {
    
    return {
        "x" : x,
        "y" : y,
        "tile_image" : tile_image,
        "walkable" : walkable,
        "trap" : trap,
        "loot" : loot
    };
};

/*
    The object for constructing the player.
    x (int): X position
    y (int): Y position
    health (int): Current health
    max_health (int): Maximum health
    kills (int): Current number of kills the player has
    donut (bool): Has the player found the Mighty Donut?
*/
function Player (x, y, health, max_health, kills, donut) {
    
    return {
        "x" : x,
        "y" : y,
        "health" : health,
        "max_health" : max_health,
        "level" : level,
        "kills" : kills,
        "donut" : donut
    };
};

/*
    The object for constructing enemies.
    x (int): X position
    y (int): Y position
    health (int): Current health
    max_health (int): Maximum health
    checked (bool): Has the enemy's death been accounted for?
*/
function Enemy (x, y, health, max_health, checked) {

    return {
        "x" : x,
        "y" : y,
        "health" : health,
        "max_health" : max_health,
        "checked" : checked
    };
};

/*
    Plays a sound file.
    sound (string): The sound file to play.
*/
function playSound(sound) {
    var audio = new Audio(sound);
    audio.play();
}

/*
    Plays music from an audio element on the page.
    music (string): The sound file to play.
*/
function playMusic(music) {
    
    var music_element = document.getElementById("music");
    if (music_element.ended == true) //Don't overlap music.
    {
        music_element.src = music;
        music_element.play();
    }
}

/*
    Updates the player's stats on the right-hand menu.
    id (string): The ID of the referenced element.
    text (string): The stat name.
    num (int): The numerator value of the stat.
    denom (int): The denominator value of the stat. 
*/
function updateStats(id, text, num, denom = 0) {

    if (denom == 0) //If there isn't a denominator, don't display one.
    {
        document.getElementById(id).innerHTML = text + ": " + num;
    }
    else
    {
        document.getElementById(id).innerHTML = text + ": " + num + "/" + denom;
    }
}

/*
    Updates the message element on the page.
    text (string): The message to display.
*/
function updateMessage(text) {
    document.getElementById("messages").innerHTML = text;
}

/*
    Generates the map for the current level.
    canvas (element): The canvas element on the page.
    player (Player): The player.

    Returns an 3-value array containing the map (an array of
    Tiles), the player, and the enemies (an array of Enemy).
*/
function generateMap(canvas, player) {

    var map = [];
    var rooms = Math.floor((Math.random() * 10)) + 10;
    var enemies = [];
    var enemy_count = Math.floor((Math.random() * rooms)) + 1;
    var enemy_index = 0;
    var enemy_rooms = [];
    var player_room = Math.floor((Math.random() * rooms));
    var height = canvas.height / 32;
    var width = canvas.width / 32;

    for (var i = 0; i < enemy_count; i ++)
    {
        enemy_rooms.push(Math.floor((Math.random() * rooms)));
    }

    enemy_rooms.sort();

    for (var y = 0; y < height; y ++)
    {
        for (var x = 0; x < width; x ++)
        {
            map.push(new Tile(x, y, 0, false, false, false));
        }
    }

    for (var i = 0; i < rooms; i ++)
    {
        room_size = Math.floor((Math.random() * 5 + 4));
        start_x = Math.floor((Math.random() * (width - room_size)));
        start_y = Math.floor((Math.random() * (height - room_size)));

        for (var y = start_y; y < start_y + room_size; y ++)
        {
            for (var x = start_x; x < start_x + room_size; x ++)
            {
                is_trap = Math.floor((Math.random() * (3 * room_size)));
                if (is_trap == 0)
                {
                    map[x + y * width].tile_image = 2;
                    map[x + y * width].trap = 1;
                    map[x + y * width].walkable = true;
                }
                else
                {
                    map[x + y * width].tile_image = 1;
                    map[x + y * width].walkable = true;
                }
            }
        }
        
        if (i == enemy_rooms[enemy_index])
        {
            enemy_pos_x = start_x + Math.floor((Math.random() * room_size));
            enemy_pos_y = start_y + Math.floor((Math.random() * room_size));
            enemies.push(new Enemy(enemy_pos_x, enemy_pos_y, 6, 6, false));
            enemy_index += 1;
        }
        
        if (i == player_room)
        {
            player.x = start_x + Math.floor((Math.random() * room_size));
            player.y = start_y + Math.floor((Math.random() * room_size));
        }

        if (i == rooms - 1 && player.level < MAX_LEVEL)
        {
            door_pos_x = start_x + Math.floor((Math.random() * room_size));
            door_pos_y = start_y + Math.floor((Math.random() * room_size));
            map[door_pos_x + door_pos_y * width].tile_image = 3;
        }
        else if (i == rooms - 1 && player.level == MAX_LEVEL)
        {
            door_pos_x = start_x + Math.floor((Math.random() * room_size));
            door_pos_y = start_y + Math.floor((Math.random() * room_size));
            map[door_pos_x + door_pos_y * width].tile_image = 4;           
        }
    }

    return [map, player, enemies];
};

/*
    Checks the player's current position on the map for collisions.
    map (array): The array of Tiles that constitutes the level.
    canvas (element): The canvas element on the page.
    player (Player): The player.
    enemies (array): The array of Enemy objects for the level.
*/
function checkPos(map, canvas, player, enemies) {

        var flat_pos = player.x + player.y * (canvas.width / 32);

        if (map[flat_pos].tile_image == 2 && map[flat_pos].trap == 1)
        {
            player.health -= 2;
            updateStats("health", "Health", player.health, player.max_health);
            updateMessage("You activated a trap and lost 2 health!");            
            map[flat_pos].trap = 2;
            printMap(map, canvas, player, enemies);
        }
        else if (map[flat_pos].tile_image == 3)
        {
            updateMessage("You entered the door and reached level " + (player.level + 1) + "!");
            main(1, player.level + 1, player);
        }
        else if (map[flat_pos].tile_image == 4)
        {
            updateMessage("Congratulations! You found the Mighty Donut and saved the servers!");
            playSound("./music/cheer.mp3");
            
            var music_element = document.getElementById("music");
            music_element.pause();
            music_element.src = "./music/fantasy_town.mp3";
            music_element.play();

            player.donut == true;
        }
};

/*
    Prints the map for the current level.
    map (array): The array of Tiles that constitutes the level.
    canvas (element): The canvas element on the page.
    player (Player): The player.
    enemies (array): The array of Enemy objects for the level.
*/
function printMap(map, canvas, player, enemies) {
    context = canvas.getContext("2d");

	map.forEach (function(tile)
	{
        if (tile.tile_image == 0)
        {
            context.fillStyle = "#16B1B5";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }
        else if (tile.tile_image == 1)
        {
            context.fillStyle = "#343434";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }
        else if (tile.tile_image == 2 && tile.trap == 1)
        {
            context.fillStyle = "#343434";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }
        else if (tile.tile_image == 2 && tile.trap == 2)
        {
            context.fillStyle = "#F16133";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }
        else if (tile.tile_image == 3)
        {
            context.fillStyle = "#FABC09";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }
        else if (tile.tile_image == 4)
        {
            context.fillStyle = "#FF85AA";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }

        if (player.x == tile.x && player.y == tile.y)
        {
            context.fillStyle = "#7435BD";
            context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
        }

        enemies.forEach(function(enemy) 
        {
            if (enemy.health > 0 && enemy.x == tile.x && enemy.y == tile.y)
            {
                context.fillStyle = "#B07D5C";
                context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
            }
            /*else if (enemy.health <= 0 && enemy.x == tile.x && enemy.y == tile.y)
            {
                context.fillStyle = "#B07D00";
                context.fillRect(tile.x * 32, tile.y * 32, canvas.width, canvas.height);
            }*/
        });
    });
    
    checkPos(map, canvas, player, enemies);
};

/*
    Moves the enemies around the map.
    map (array): The array of Tiles that constitutes the level.
    canvas (element): The canvas element on the page.
    player (Player): The player.
    dir (int): The player's direction from 0-4, going
               counter-clockwise where 0 is left.
    enemies (array): The array of Enemy objects for the level.
*/
function moveEnemies(map, canvas, player, dir, enemies){

    enemies.forEach(function(enemy) 
    {
        if (player.x == enemy.x && player.y == enemy.y && enemy.health > 0)
        {
            var damage_to_enemy = 1 + Math.floor((Math.random() * 3));
            var damage_to_player = 1 + Math.floor((Math.random() * 3));
            enemy.health -= damage_to_enemy;
            player.health -= damage_to_player;
            updateMessage("You took " + damage_to_player + " damage and dealt " + damage_to_enemy + " damage!");

            if (enemy.health <= 0 && enemy.checked == false)
            {
                enemy.checked == true;
                player.kills += 1;
                updateStats("kills", "Ghosts Busted", player.kills);
                updateMessage("You defeated a bagel ghost!");
            }

            if (player.health <= 0)
            {
                if(player.level > 1)
                {
                    player.level -= 1;
                }
                main(1, player.level, player);
                updateMessage("You have perished! Press any arrow key to continue.");
            }

            updateStats("health", "Health", player.health, player.max_health);

            playSound("./music/attack.mp3");
            playSound("./music/damaged.mp3");

            if (dir == 0) 
            {
                player.x -= 1;
            }
            else if (dir == 1) 
            {
                player.y += 1;
            }
            else if (dir == 2) 
            {
                player.x += 1;
            }
            else if (dir == 3) 
            {
                player.y -= 1;
            }
        }
        else if (enemy.health > 0)
        {
            var move_to_player = Math.floor((Math.random() * 2));
            if (move_to_player == 0)
            {
                if (enemy.x + 1 != player.x && enemy.y != player.y && enemy.x < player.x && map[(enemy.x + 1) + enemy.y * columns].walkable == true)
                {
                    enemy.x += 1;
                }
                if (enemy.x - 1 != player.x && enemy.y != player.y && enemy.x > player.x && map[(enemy.x - 1) + enemy.y * columns].walkable == true)
                {
                    enemy.x -= 1;
                }
                if (enemy.x != player.x && enemy.y + 1 != player.y && enemy.y < player.y && map[enemy.y + (enemy.y + 1) * columns].walkable == true)
                {
                    enemy.y += 1;
                }
                if (enemy.x != player.x && enemy.y - 1 != player.y && enemy.y > player.y && map[enemy.x + (enemy.y - 1) * columns].walkable == true)
                {
                    enemy.y -= 1;
                }
            }
            else
                {
                var enemy_dir = Math.floor((Math.random() * 4));
                if (enemy.x + 1 != player.x && enemy.y != player.y && enemy_dir == 0 && map[(enemy.x + 1) + enemy.y * columns].walkable == true)
                {
                    enemy.x += 1;
                }
                else if (enemy.x != player.x && enemy.y - 1 != player.y && enemy_dir == 1 && map[enemy.x + (enemy.y - 1) * columns].walkable == true)
                {
                    enemy.y -= 1;
                }
                else if (enemy.x - 1 != player.x && enemy.y != player.y && enemy_dir == 2 && map[(enemy.x - 1) + enemy.y * columns].walkable == true)
                {
                    enemy.x -= 1;
                }
                else if (enemy.x != player.x && enemy.y + 1 != player.y && enemy_dir == 3 && map[enemy.x + (enemy.y + 1) * columns].walkable == true)
                {
                    enemy.y += 1;
                }
            }
        }
    });
}

/*
    Moves the player according to the key pressed.
    map (array): The array of Tiles that constitutes the level.
    canvas (element): The canvas element on the page.
    player (Player): The player.
    dir (int): The player's direction from 0-4, going
               counter-clockwise where 0 is left.
    enemies (array): The array of Enemy objects for the level.
*/
function move(map, canvas, player, dir, enemies){
    
    if (player.donut == false)
    {
        columns = canvas.width / 32;
        if (dir == 0 && player.x < canvas.width && map[(player.x + 1) + player.y * columns].walkable == true)
        {
            player.x += 1;
            if (player.health < player.max_health)
            {
                player.health += 1;
                updateStats("health", "Health", player.health, player.max_health);
            }
            playSound("./music/step.wav");
        }
        else if (dir == 1 && player.y > 0 && map[player.x + (player.y - 1) * columns].walkable == true)
        {
            player.y -= 1;
            if (player.health < player.max_health)
            {
                player.health += 1;
                updateStats("health", "Health", player.health, player.max_health);
            }
            playSound("./music/step.wav");
        }
        else if (dir == 2 && player.x > 0 && map[(player.x - 1) + player.y * columns].walkable == true)
        {
            player.x -= 1;
            if (player.health < player.max_health)
            {
                player.health += 1;
                updateStats("health", "Health", player.health, player.max_health);
            }
            playSound("./music/step.wav");
        }
        else if (dir == 3 && player.y < canvas.height && map[player.x + (player.y + 1) * columns].walkable == true)
        {
            player.y += 1;
            if (player.health < player.max_health)
            {
                player.health += 1;
                updateStats("health", "Health", player.health, player.max_health);
            }
            playSound("./music/step.wav");
        }

        moveEnemies(map, canvas, player, dir, enemies);
        printMap(map, canvas, player, enemies);
    }
};

/*
    The main function that sets up new levels.
    new_gen (int): Is this a completely new dungeon generation?
    level (int): Current level number.
    player (Player): The player.
*/
function main(new_gen = 0, level = 1, player = new Player(0, 0)) {

    canvas = document.getElementById("gameFrame");
    canvas.width = 640;
    canvas.height = 480;

    player.max_health = 6;
    player.health = player.max_health;
    player.level = level;

    var components = generateMap(canvas, player);
    var map = components[0];
    player = components[1];
    var enemies = components[2];

    updateStats("level", "Level", player.level, MAX_LEVEL);
    updateStats("health", "Health", player.health, player.max_health);

    printMap(map, canvas, player, enemies);

    if (new_gen == 0)
    {
        player.kills = 0;
        player.donut = false;
    }

    var song = Math.floor((Math.random() * 4));    
    var music;
    if (song == 0)
    {
        music = "./music/fantasy_boss.mp3";
    }
    else if (song == 1)
    {
        music = "./music/adventure_awaits.mp3";
    }
    else if (song == 2)
    {
        music = "./music/respectfully_resigned.wav";
    }
    else if (song == 3)
    {
        music = "./music/gb_theme.mp3";
    }
    playMusic(music);

    document.onkeydown = keyPress;

    function keyPress(e) {
        
        e = e || window.event;
        
        if (e.keyCode == '38') {
            move(map, canvas, player, 1, enemies);
        }
        else if (e.keyCode == '40') {
            move(map, canvas, player, 3, enemies);
        }
        else if (e.keyCode == '37') {
            move(map, canvas, player, 2, enemies);
        }
        else if (e.keyCode == '39') {
            move(map, canvas, player, 0, enemies);
        }
    }
};

window.onload = main();