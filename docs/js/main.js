let world;

function setup() {
	createCanvas(innerWidth, innerHeight);
	disableFriendlyErrors = true;
	world = new World();
	world.setup();
}

function draw() {
	background(0);
	fill(255);
	stroke(255);
	world.render();
	world.update();
}

function mousePressed() {
	for (let fish of world.fishes) {
		let mouse = world.camera.screenToWorld(mouseX, mouseY);
		let distance = dist(mouse.x, mouse.y, fish.position.x, fish.position.y);
		if (distance < world.mouseRadius) {
			fish.scare();
		}
	}
}

function windowResized() {
	resizeCanvas(innerWidth, innerHeight);
	world = new World();
	world.setup();
}