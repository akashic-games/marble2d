import { Body, CircleShape, PolygonShape } from "@akashic-extension/marble2d";
import { drawLine } from "./gfx";

export interface BodyEParameterObject extends g.EParameterObject {
	body: Body;
	circleImageAsset: g.ImageAsset;
	showBounds?: boolean;
}

export class BodyE extends g.E {
	body: Body;

	showBounds: boolean;

	private circleSurface: g.Surface;

	constructor(param: BodyEParameterObject) {
		super(param);

		this.body = param.body;
		this.circleSurface = param.circleImageAsset.asSurface();
		this.showBounds = param.showBounds ?? false;
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		if (this.body.shape instanceof CircleShape) {
			this.renderCircleShape(renderer);
		} else if (this.body.shape instanceof PolygonShape) {
			this.renderPolygonShape(renderer);
		}

		if (this.showBounds) {
			this.drawBounds(renderer);
		}

		return true;
	}

	private renderCircleShape(renderer: g.Renderer): void {
		const shape = this.body.shape as CircleShape;
		const sx = shape.radius * 2 / this.circleSurface.width;
		const sy = shape.radius * 2 / this.circleSurface.height;

		renderer.save();

		renderer.transform([
			sx, 0,
			0, sy,
			this.width * (this.anchorX ?? 0), this.height * (this.anchorY ?? 0)
		]);

		renderer.drawImage(
			this.circleSurface,
			0, 0,
			this.circleSurface.width, this.circleSurface.height,
			-this.circleSurface.width / 2, -this.circleSurface.height / 2
		);

		renderer.restore();
	}

	private renderPolygonShape(renderer: g.Renderer): void {
		const shape = this.body.shape as PolygonShape;

		renderer.save();

		renderer.transform([
			1, 0,
			0, 1,
			this.width * (this.anchorX ?? 0), this.height * (this.anchorY ?? 0)
		]);

		for (let i = 0; i < shape.localVertices.length; i++) {
			const from = shape.localVertices[i];
			const to = shape.localVertices[(i + 1) % shape.localVertices.length];
			drawLine(renderer, from, to, "blue", "inside");
		}

		renderer.restore();
	}

	private drawBounds(renderer: g.Renderer): void {
		renderer.fillRect(0, 0, this.width, 1, "red");
		renderer.fillRect(this.width - 1, 0, 1, this.height, "green");
		renderer.fillRect(0, this.height - 1, this.width, 1, "blue");
		renderer.fillRect(0, 0, 1, this.height, "yellow");
	}
}
