import { Rot } from "./Rot";
import { Vec2 as Vec2_ } from "./Vec2";
import { Vec2Like } from "./Vec2Like";

// import した値をそのまま使うと TS のビルド方法によっては都度 getter 経由のアクセスになって遅い。
// そのためアクセス頻度の高い値をローカルで定義する。
type Vec2 = Vec2_;
const Vec2 = Vec2_;

/**
 * トランスフォーム。
 *
 * 回転と並行移動を表すクラス。
 */
export class Transform {
	/**
	 * トランスフォーム生成。
	 *
	 * @param angle 角度。
	 * @param position 移動量。
	 * @returns トランスフォーム。
	 */
	static makeWithAnglePosition(angle: number, position: Vec2Like): Transform {
		return new Transform(Rot.makeRotWithAngle(angle), new Vec2(position));
	}

	/**
	 * 回転。
	 */
	rotation: Rot;

	/**
	 * 移動。
	 */
	position: Vec2;

	/**
	 * コンストラクタ。
	 *
	 * @param rotation 回転量。
	 * @param position 移動量。
	 */
	constructor(rotation: Rot, position: Vec2) {
		this.rotation = rotation;
		this.position = position;
	}

	/**
	 * 自身を複製する
	 * @returns 複製。
	 */
	clone(): Transform {
		return new Transform(this.rotation.clone(), this.position.clone());
	}

	/**
	 * トランスフォームを乗算する。
	 *
	 * @param v 乗算するトランスフォーム。
	 * @returns this
	 */
	mul(v: Transform): this {
		this.position.add(this.rotation.mulVec(v.position.clone()));
		this.rotation.mul(v.rotation);
		return this;
	}

	/**
	 * ベクトルを回転・並行移動する。
	 *
	 * @param v 操作対象となるベクトル。
	 * @returns v
	 */
	mulVec<T extends Vec2Like>(v: T): T {
		Vec2.add(this.rotation.mulVec(v), this.position);
		return v;
	}

	/**
	 * ベクトルを逆方向に回転・並行移動する。
	 *
	 * @param v 操作対象となるベクトル。
	 * @returns v
	 */
	mulTVec<T extends Vec2Like>(v: T): T {
		Vec2.sub(v, this.position);
		return this.rotation.mulTVec(v);
	}
}
