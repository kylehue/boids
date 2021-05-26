class Fish {
	constructor() {
		//Movement
		this.angle = random(-PI, PI);
		this.position = createVector(random(-world.size / 2, world.size / 2), random(-world.size / 2, world.size / 2));
		this.velocity = createVector(cos(this.angle), sin(this.angle));
		this.speed = random(2.3, 2.6);
		this.direction = random([0.005, -0.01]);
		this.senseDirection = random(-0.4, 0.4);

		//Appearance
		this.size = random(6, 12);
		this.color = random([
			"#9d8aff",
			"#908aff",
			"#8a92ff",
			"#7aa0ff",
			"#69afff"
		]);

		//Sensors
		this.visionRadius = this.size * 4;
		this.avoidRadius = this.size * 1.3;

		//Sense animation
		this.senseAnimationFrame = 0;
		this.senseAnimationLength = 30;
		this.senseAnimationSpeed = 4;
	}

	render() {
		fill(this.color);
		push();
		//Transformation
		translate(this.position.x, this.position.y);
		rotate(this.angle);

		//Draw triangle
		beginShape();
		vertex(-this.size, -this.size / 2);
		vertex(this.size, 0);
		vertex(-this.size, this.size / 2);
		endShape(CLOSE);

		//Start sense animation when mouse is pressed
		if (mouseIsPressed && this.senseAnimationFrame == 0) {

		}

		//Sense animation
		if (this.senseAnimationFrame > 0) {
			let mouse = world.camera.screenToWorld(mouseX, mouseY);
			let distance = dist(mouse.x, mouse.y, this.position.x, this.position.y);
			let currentFrame = this.senseAnimationFrame * this.senseAnimationSpeed;
			let totalFrames = this.senseAnimationSpeed * this.senseAnimationLength;
			let maxOpacity = map(distance, 0, world.mouseRadius, 100, 0);
			let opacity = map(currentFrame, 0, totalFrames, maxOpacity, 0);

			//Draw
			let clr = color(this.color).levels;
			stroke(clr[0], clr[1], clr[2], opacity);
			noFill();
			strokeWeight(3);
			beginShape();
			circle(0, 0, currentFrame / 2 + this.size * 2);
			endShape();
		}

		//Show vision
		/*noFill();
		stroke(255, 0, 0, 50);
		strokeWeight(1);
		beginShape();
		circle(0, 0, this.visionRadius * 2);
		circle(0, 0, this.avoidRadius);
		endShape();*/
		pop();
	}

	update() {
		this.checkWall();
		this.alignSchool();
		this.avoidFish();

		//Movement
		this.position.add(this.velocity);
		this.velocity.x = cos(this.angle) * this.speed;
		this.velocity.y = sin(this.angle) * this.speed;
		this.angle -= this.direction;

		//Change angle if mouse is pressed
		if (this.senseAnimationFrame > 0) {
			this.angle += this.senseDirection;

			//Tracking the animation frame
			if (this.senseAnimationFrame > this.senseAnimationLength) {
				this.senseAnimationFrame = 0;
			} else {
				this.senseAnimationFrame++;
			}
		}
	}

	avoidFish() {
		//Retrieve from quadtree
		let objects = world.quadtree.retrieve({
			x: this.position.x - this.size,
			y: this.position.y - this.size,
			width: this.size * 2,
			height: this.size * 2
		});

		for (let object of objects) {
			if (object.self instanceof Fish && object.self != this) {
				let fish = object.self;
				let distance = dist(this.position.x, this.position.y, fish.position.x, fish.position.y);

				//Check if <this fish> is colliding to another fish
				if (distance < this.avoidRadius) {
					//Change angle
					let angle = atan2(fish.position.y - this.position.y, fish.position.x - this.position.x);
					this.angle = lerp(this.angle, -angle, 0.1 / distance);
				}
			}
		}
	}

	alignSchool() {
		//Retrieve from quadtree
		let objects = world.quadtree.retrieve({
			x: this.position.x - this.size,
			y: this.position.y - this.size,
			width: this.size * 2,
			height: this.size * 2
		});

		for (let object of objects) {
			if (object.self instanceof Fish && object.self != this) {
				let fish = object.self;
				let distance = dist(this.position.x, this.position.y, fish.position.x, fish.position.y);

				//Check if <this fish> sees another school
				if (distance < this.visionRadius + fish.visionRadius) {
					//Move towards the school
					this.angle = lerp(this.angle, fish.angle, 0.01);
				}
			}
		}
	}

	scare() {
		this.senseAnimationFrame++;
	}

	checkWall() {
		//World infinity
		if (this.position.x - this.size > world.size / 2) {
			this.position.x -= world.size + this.size * 2;
			//this.position.y -= sin(this.angle) * world.size;
		} else if (this.position.x + this.size < -world.size / 2) {
			this.position.x += world.size + this.size * 2;
			//this.position.y -= sin(this.angle) * world.size;
		}

		if (this.position.y - this.size > world.size / 2) {
			this.position.y -= world.size + this.size * 2;
			//this.position.x -= cos(this.angle) * world.size;
		} else if (this.position.y + this.size < -world.size / 2) {
			this.position.y += world.size + this.size * 2;
			//this.position.x -= cos(this.angle) * world.size;
		}
	}

	addToQuadtree(quadtree) {
		quadtree.insert({
			x: this.position.x - this.size,
			y: this.position.y - this.size,
			width: this.size * 2,
			height: this.size * 2,
			self: this
		})
	}
}