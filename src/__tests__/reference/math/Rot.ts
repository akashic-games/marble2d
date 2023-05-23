import { Vec2Like } from "./Vec2Like";

export class Rot {
	static makeRotWithAngle(angle: number = 0): Rot {
		if (angle === 0) {
			return new Rot(1, 0);
		} else {
			return new Rot(Math.cos(angle), Math.sin(angle));
		}
	}

	c: number;
	s: number;

	constructor(c: number, s: number) {
		this.c = c;
		this.s = s;
	}

	clone(): Rot {
		return new Rot(this.c, this.s);
	}

	setAngle(angle: number): this {
		if (angle === 0) {
			this.c = 1;
			this.s = 0;
		} else {
			this.c = Math.cos(angle);
			this.s = Math.sin(angle);
		}
		return this;
	}

	mul(v: Rot): this {
		const c = this.c * v.c - this.s * v.s;
		const s = this.s * v.c + this.c * v.s;
		this.c = c;
		this.s = s;
		return this;
	}

	mulVec<T extends Vec2Like>(v: T): T {
		const x = this.c * v.x - this.s * v.y;
		const y = this.s * v.x + this.c * v.y;
		v.x = x;
		v.y = y;
		return v;
	}

	mulTVec<T extends Vec2Like>(v: T): T {
		const x = this.c * v.x + this.s * v.y;
		const y = -this.s * v.x + this.c * v.y;
		v.x = x;
		v.y = y;
		return v;
	}
}
