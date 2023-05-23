import { Shape } from "./Shape";

/**
 * サークルシェイプ。
 *
 * 物理エンジンが内部的に利用する。開発者はこれを利用してはならない。
 */
export class CircleShape implements Shape {
	type: "circle" = "circle";

	/**
	 * 円の半径。
	 */
	radius: number;

	_bounds: number;

	constructor(radius: number) {
		this.radius = radius;
		this._bounds = radius;
	}
}
