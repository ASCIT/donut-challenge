var song;
var name;
var music;
var next_music;
var prev_music;
var random;
var random_music;

$('#pause').hide();

initialize($('#songlist li:first-child'));

// Creates and initializes an Audio object named music
function initialize(element){
  song = element.attr('song');
  name = element.text();

  music = new Audio('music/' + song);

  $('.name').text(name);
  $('#songlist li').removeClass('active');
	element.addClass('active');
}


// Controls the play button.
// Uses .hide() and .show() to alternate between the graphics of the play
// and pause buttons.
$('#play').click(function(){
	music.play();
	$('#play').hide();
	$('#pause').show();
});

// Controls the pause button.
// Uses .hide() and .show() to alternate between the graphics of the play
// and pause buttons.
$('#pause').click(function(){
	music.pause();
	$('#play').show();
	$('#pause').hide();
});

// Controls the shuffle button.
// Accesses a song at a random position in the list and play
// this song.
$('#shuffle').click(function(){
	music.pause();
  random = Math.floor( (Math.random() *
           getElementsByTagName('li').length) + 1 );
  random_music = $('#songlist li:nth-child(random)');
  initialize(random_music);
  music.play();
});

// Controls the button that allows users to jump to the previous song
$('#previous').click(function(){
  // Pauses the current music
	music.pause();
  // Finds the previous music
  // If no previous music is found then automatically jump to the
  // last music in the list of songs
  prev_music = $('#songlist li.active').prev();
	if(prev_music.length == 0){
		prev_music = $('#songlist li:last-child');
	}
	initialize(prev_music);
	music.play();
});

// Controls the button that allows users to jump to the next song
$('#next').click(function(){
  // Pauses the current music
	music.pause();
  // Finds the next music
  // If no next music is found then automatically jump to the first
  // music in the list of songs
  next_music = $('#songlist li.active').next();
	if(next_music.length == 0){
		next_music = $('#songlist li:first-child');
	}
	initialize(next_music);
	music.play();
});

// Allows users to click on the name of the song in the
// list and play it.
$('#songlist li').click(function(){
	music.pause();
	initialize($(this));
	$('#play').hide();
	$('#pause').show();
	music.play();
});
