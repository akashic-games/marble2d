import { Rot } from "./Rot";
import { Vec2 } from "./Vec2";
import { Vec2Like } from "./Vec2Like";

export class Transform {
	static makeWithAnglePosition(angle: number, position: Vec2Like): Transform {
		return new Transform(Rot.makeRotWithAngle(angle), new Vec2(position));
	}

	rotation: Rot;
	position: Vec2;

	constructor(rotation: Rot, position: Vec2) {
		this.rotation = rotation;
		this.position = position;
	}

	clone(): Transform {
		return new Transform(this.rotation.clone(), this.position.clone());
	}

	mul(v: Transform): this {
		this.position.add(this.rotation.mulVec(v.position.clone()));
		this.rotation.mul(v.rotation);
		return this;
	}

	mulVec<T extends Vec2Like>(v: T): T {
		Vec2.add(this.rotation.mulVec(v), this.position);
		return v;
	}

	mulTVec<T extends Vec2Like>(v: T): T {
		Vec2.sub(v, this.position);
		return this.rotation.mulTVec(v);
	}
}
