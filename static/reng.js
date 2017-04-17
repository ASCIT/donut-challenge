function donut() {
	document.getElementById("donut").style.left = Math.random() * window.innerWidth - 100 + "px";
	document.getElementById("donut").style.top = Math.random() *window.innerHeight - 100 + "px";
}

donut();

time = 0;
setInterval(function() {
	time += 1;
	if (time >= 3) {
		donut();
		time = 0;
	}
}, 200);