class World {
	constructor() {
		this.size = width * 2;
		this.panSize = this.size / 8;
		this.camera = new Camera2D(drawingContext, {
			moveTransitionSpeed: 0.1,
			zoomTransitionSpeed: 0.1
		});
		this.quadtree = new Quadtree({
			x: -this.size / 2,
			y: -this.size / 2,
			width: this.size,
			height: this.size
		}, 6);

		this.fishCount = round(this.size / 4);
		this.fishes = [];
		this.mouseRadius = 100;

		this.color = "#fafcff";
	}

	setup() {
		for (var i = 0; i < this.fishCount; i++) {
			this.fishes.push(new Fish());
		}
	}

	render() {
		this.camera.begin();

		//Camera
		let mouse = this.camera.screenToWorld(mouseX, mouseY);
		let panX = map(mouse.x, -this.size / 2, this.size / 2, -this.panSize, this.panSize);
		let panY = map(mouse.y, -this.size / 2, this.size / 2, -this.panSize, this.panSize);
		this.camera.moveTo(panX, panY);
		this.camera.zoomTo(width);

		//Background
		noStroke();
		fill(this.color);
		beginShape();
		rect(-this.size / 2, -this.size / 2, this.size, this.size);
		endShape();

		//Render fishes
		for (let fish of this.fishes) {
			if (this.isVisible(fish.position, fish.size * 2)) fish.render();
		}

		this.camera.end();
	}

	isVisible(position, offset) {
		offset = offset || 0;
		if (position.x + offset > this.camera.viewport.left && position.x - offset < this.camera.viewport.right && position.y + offset > this.camera.viewport.top && position.y - offset < this.camera.viewport.bottom) {
			return true;
		}

		return false;
	}

	update() {
		//Add fishes to quadtree
		for (let fish of this.fishes) {
			fish.addToQuadtree(this.quadtree);
		}

		//Update fishes
		for (let fish of this.fishes) {
			fish.update();
		}

		//Clear quadtree
		this.quadtree.clear();
	}
}