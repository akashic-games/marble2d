import { Vec2, Vec2Like } from "@akashic-extension/marble2d";
import { drawLine, ThickMode } from "./gfx";

export interface LineEParameterObject extends g.EParameterObject {
	from?: Vec2Like;
	to?: Vec2Like;
	cssColor?: string;
	thickMode?: ThickMode;
}

export class LineE extends g.E {
	from: Vec2;
	to: Vec2;

	cssColor: string;
	thickMode: ThickMode;

	constructor(param: LineEParameterObject) {
		super(param);

		this.from = new Vec2(param.from);
		this.to = new Vec2(param.to);
		this.cssColor = param.cssColor ?? "red";
		this.thickMode = param.thickMode ?? "center";
	}

	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		drawLine(renderer, this.from, this.to, this.cssColor, this.thickMode);
		return true;
	}
}
