import { Vec2, Vec2Like } from "@akashic-extension/marble2d";

export type ThickMode = "inside" | "outside" | "center";

export function drawLine(
	renderer: g.Renderer, from: Vec2Like, to: Vec2Like, cssColor: string,
	thickMode: ThickMode = "inside"
): void {
	const dir = new Vec2(to).sub(from);
	const width = dir.length();
	const height = 2;

	dir.normalize();

	renderer.save();

	renderer.transform([
		dir.x, dir.y,
		-dir.y, dir.x,
		from.x, from.y
	]);

	const offsetY = thickMode === "center" ?
		-height / 2 :
		thickMode === "outside" ? -height : 0;

	renderer.fillRect(0, offsetY, width, height, cssColor);

	renderer.restore();
}
