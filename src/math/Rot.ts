import { Vec2Like } from "./Vec2Like";

/**
 * 回転クラス。
 */
export class Rot {
	/**
	 * 与えられた角度の Rot インスタンスを生成する。
	 *
	 * @param angle 角度[rad]。
	 * @returns
	 */
	static makeRotWithAngle(angle: number = 0): Rot {
		if (angle === 0) {
			return new Rot(1, 0);
		} else {
			return new Rot(Math.cos(angle), Math.sin(angle));
		}
	}

	/**
	 * 回転を表す余弦。
	 */
	c: number;

	/**
	 * 回転を表す正弦。
	 */
	s: number;

	/**
	 * コンストラクタ。
	 *
	 * @param c 回転を表す余弦。
	 * @param s 回転を表す正弦。
	 */
	constructor(c: number, s: number) {
		this.c = c;
		this.s = s;
	}

	/**
	 * 自身の複製を生成する。
	 * @returns 複製。
	 */
	clone(): Rot {
		return new Rot(this.c, this.s);
	}

	/**
	 * 角度の設定。
	 *
	 * @param angle 角度[rad]。
	 * @returns this
	 */
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

	/**
	 * ローテーションを乗算する。
	 *
	 * @param v ローテーション。
	 * @returns this
	 */
	mul(v: Rot): this {
		const c = this.c * v.c - this.s * v.s;
		const s = this.s * v.c + this.c * v.s;
		this.c = c;
		this.s = s;
		return this;
	}

	/**
	 * ベクトルを回転する。
	 *
	 * @param v ベクトル。
	 * @returns v
	 */
	mulVec<T extends Vec2Like>(v: T): T {
		const x = this.c * v.x - this.s * v.y;
		const y = this.s * v.x + this.c * v.y;
		v.x = x;
		v.y = y;
		return v;
	}

	/**
	 * ベクトルを逆回転する。
	 *
	 * @param v ベクトル。
	 * @returns v
	 */
	mulTVec<T extends Vec2Like>(v: T): T {
		const x = this.c * v.x + this.s * v.y;
		const y = -this.s * v.x + this.c * v.y;
		v.x = x;
		v.y = y;
		return v;
	}
}
