import { Vec2Like } from "./Vec2Like";

export class Vec2 {
	static readonly zero: Vec2Like = { x: 0, y: 0 };

	x: number;
	y: number;

	static copy(v1: Vec2Like, v2: Vec2Like): void {
		v1.x = v2.x;
		v1.y = v2.y;
	}

	static add(v1: Vec2Like, v2: Vec2Like): void {
		v1.x += v2.x;
		v1.y += v2.y;
	}

	static sub(v1: Vec2Like, v2: Vec2Like): void {
		v1.x -= v2.x;
		v1.y -= v2.y;
	}

	static dot(v1: Vec2Like, v2: Vec2Like): number {
		return v1.x * v2.x + v1.y * v2.y;
	}

	static cross(v1: Vec2Like, v2: Vec2Like): number {
		return v1.x * v2.y - v1.y * v2.x;
	}

	constructor(xOrVec2Like?: number | Vec2Like, y: number = 0) {
		if (typeof xOrVec2Like === "number") {
			this.x = xOrVec2Like;
			this.y = y;
		} else {
			const v = xOrVec2Like || Vec2.zero;
			this.x = v.x;
			this.y = v.y;
		}
	}

	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	copy(v: Vec2Like): this {
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	equal(other: Vec2Like): boolean {
		return this.x === other.x && this.y === other.y;
	}

	add(other: Vec2Like): this {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	sub(other: Vec2Like): this {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	scale(value: number): this {
		this.x *= value;
		this.y *= value;
		return this;
	}

	dot(other: Vec2Like): number {
		return this.x * other.x + this.y * other.y;
	}

	cross(other: Vec2Like): number {
		return this.x * other.y - this.y * other.x;
	}

	squaredLength(): number {
		return this.x * this.x + this.y * this.y;
	}

	length(): number {
		return Math.sqrt(this.squaredLength());
	}

	normalize(): this {
		const len = this.length() || 1;
		this.x /= len;
		this.y /= len;
		return this;
	}

	rotate(angle: number): this {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		const x = c * this.x - s * this.y;
		const y = s * this.x + c * this.y;

		this.x = x;
		this.y = y;

		return this;
	}

	normal(): Vec2 {
		return new Vec2(this.y, -this.x).normalize();
	}

	negate(): this {
		this.x *= -1;
		this.y *= -1;
		return this;
	}
}
