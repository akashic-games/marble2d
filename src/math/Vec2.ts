import { Vec2Like } from "./Vec2Like";

/**
 * ２次元ベクトル。
 */
export class Vec2 {
	/**
	 * ゼロベクトルライク。
	 */
	static readonly zero = { x: 0, y: 0 } as const;

	/**
	 * X座標。
	 */
	x: number;

	/**
	 * Y座標。
	 */
	y: number;

	static copy(v1: Vec2Like, v2: Vec2Like): void {
		v1.x = v2.x;
		v1.y = v2.y;
	}

	/**
	 * ベクトルの加算。
	 *
	 * @param v1 ベクトル。このベクトルが変更される。
	 * @param v2 ベクトル。
	 * @returns
	 */
	static add(v1: Vec2Like, v2: Vec2Like): void {
		v1.x += v2.x;
		v1.y += v2.y;
	}

	/**
	 * ベクトルの減算。
	 *
	 * @param v1 ベクトル。このベクトルが変更される。
	 * @param v2 ベクトル。
	 * @returns
	 */
	static sub(v1: Vec2Like, v2: Vec2Like): void {
		v1.x -= v2.x;
		v1.y -= v2.y;
	}

	/**
	 * 内積。
	 *
	 * @param v1 ベクトル。
	 * @param v2 ベクトル。
	 * @returns 内積の値。
	 */
	static dot(v1: Vec2Like, v2: Vec2Like): number {
		return v1.x * v2.x + v1.y * v2.y;
	}

	/**
	 * 外積。
	 *
	 * @param v1 ベクトル。
	 * @param v2 ベクトル。
	 * @returns 外積ベクトルのZ成分。
	 */
	static cross(v1: Vec2Like, v2: Vec2Like): number {
		return v1.x * v2.y - v1.y * v2.x;
	}

	/**
	 * 正規化。
	 *
	 * @param v 正規化するベクトル。
	 * @returns v の元の長さ。
	 */
	static normalize(v: Vec2Like): number {
		const len = Math.sqrt(v.x * v.x + v.y * v.y);

		if (len !== 0) {
			v.x /= len;
			v.y /= len;
		}

		return len;
	}

	/**
	 * コンストラクタ。
	 */
	constructor(x?: number, y?: number);
	/**
	 * コンストラクタ。
	 */
	constructor(v?: Vec2Like);
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

	/**
	 * ベクトルを複製する。
	 *
	 * @returns 複製。
	 */
	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	/**
	 * ベクトルの各成分をコピーする。
	 *
	 * @param v コピー元ベクトル。
	 * @returns this
	 */
	copy(v: Vec2Like): this {
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	/**
	 * ベクトルの比較。
	 *
	 * @param other 比較対象のベクトル。
	 * @returns 一致した時、真。
	 */
	equal(other: Vec2Like): boolean {
		return this.x === other.x && this.y === other.y;
	}

	/**
	 * ベクトルの加算。
	 *
	 * @param other 加算するベクトル。
	 * @returns this
	 */
	add(other: Vec2Like): this {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	/**
	 * ベクトルの減算。
	 *
	 * @param other 減算するベクトル。
	 * @returns this
	 */
	sub(other: Vec2Like): this {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	/**
	 * ベクトルのスケール。
	 *
	 * @param value スケールする値。
	 * @returns this
	 */
	scale(value: number): this {
		this.x *= value;
		this.y *= value;
		return this;
	}

	/**
	 * 内積。
	 *
	 * @param other ベクトル。
	 * @returns 内積。
	 */
	dot(other: Vec2Like): number {
		return this.x * other.x + this.y * other.y;
	}

	/**
	 * 外積。
	 *
	 * @param other ベクトル。
	 * @returns 新規外積ベクトル。
	 */
	cross(other: Vec2Like): number {
		return this.x * other.y - this.y * other.x;
	}

	/**
	 * ベクトルの長さの二乗。
	 */
	squaredLength(): number {
		return this.x * this.x + this.y * this.y;
	}

	/**
	 * ベクトルの長さ。
	 */
	length(): number {
		return Math.sqrt(this.squaredLength());
	}

	/**
	 * ベクトルを正規化する。
	 *
	 * @returns this
	 */
	normalize(): this {
		const len = this.length() || 1;
		this.x /= len;
		this.y /= len;
		return this;
	}

	/**
	 * ベクトルを回転する。
	 *
	 * @param angle 回転角[rad]。
	 * @returns this
	 */
	rotate(angle: number): this {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		const x = c * this.x - s * this.y;
		const y = s * this.x + c * this.y;

		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * 法線ベクトルを求める。
	 *
	 * @returns 新規法線ベクトル。
	 */
	normal(): Vec2 {
		return new Vec2(this.y, -this.x).normalize();
	}

	/**
	 * ベクトルの各成分の符号を反転する。
	 *
	 * @returns this
	 */
	negate(): this {
		this.x *= -1;
		this.y *= -1;
		return this;
	}
}
