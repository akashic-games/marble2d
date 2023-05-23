import { Shape } from "./Shape";

export class CircleShape implements Shape {
	type: "circle" = "circle";

	radius: number;

	constructor(radius: number) {
		this.radius = radius;
	}
}
