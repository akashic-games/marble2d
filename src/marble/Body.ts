import { Vec2Like, Vec2, Transform } from "../math";
import { Shape } from "./Shape";

/**
 * 剛体コンストラクタパラメタ。
 */
export interface BodyParameterObject {
	/**
	 * 質量。
	 *
	 * ０以上の実数。質量が０の時、剛体は常に静止する。
	 */
	mass: number;

	/**
	 * 慣性モーメント。
	 */
	momentOfInertia: number;

	/**
	 * 位置。
	 */
	position: Vec2Like;

	/**
	 * 速度。
	 */
	velocity?: Vec2Like;

	/**
	 * 回転角。
	 */
	angle?: number;

	/**
	 * 角速度。
	 */
	angularVelocity?: number;

	/**
	 * 力。
	 */
	force?: Vec2Like;

	/**
	 * トルク。
	 */
	torque?: number;

	/**
	 * 反発係数。
	 */
	restitution?: number;

	/**
	 * 摩擦係数。
	 */
	mu?: number;

	/**
	 * 並進速度の減衰係数。
	 *
	 * 0 の時、減衰しない。1より大きくても良い。
	 *
	 * 省略時 0 。
	 */
	linearDamping?: number;

	/**
	 * 角速度の減衰係数。
	 *
	 * 0 の時、減衰しない。1より大きくても良い。
	 *
	 * 省略時 0 。
	 */
	angularDamping?: number;

	/**
	 * 物体を安定させる係数。
	 *
	 * 省略時 1 。
	 */
	betaScale?: number;

	/**
	 * 物体の形状。
	 */
	shape: Shape;

	/**
	 * 開発者が利用できるプロパティ。
	 */
	userData?: unknown;
}

/**
 * 剛体。
 */
export class Body {
	/**
	 * 質量。
	 *
	 * ０以上の実数。質量が０の時、剛体は常に静止する。
	 */
	mass: number;

	/**
	 * 質量の逆数。
	 */
	invMass: number;

	/**
	 * 慣性モーメント。
	 */
	momentOfInertia: number;

	/**
	 * 慣性モーメントの逆数。
	 */
	invI: number;

	/**
	 * 位置。
	 */
	position: Vec2;

	/**
	 * 速度。
	 */
	velocity: Vec2;

	/**
	 * 回転角。
	 */
	angle: number;

	/**
	 * 角速度。
	 */
	angularVelocity: number;

	/**
	 * 力。
	 */
	force: Vec2;

	/**
	 * トルク。
	 */
	torque: number;

	/**
	 * 反発係数。
	 */
	restitution: number;

	/**
	 * 摩擦係数。
	 */
	mu: number;

	/**
	 * 並進速度の減衰係数。
	 *
	 * 0 の時、減衰しない。1より大きくても良い。
	 */
	linearDamping: number;

	/**
	 * 角速度の減衰係数。
	 *
	 * 0 の時、減衰しない。1より大きくても良い。
	 */
	angularDamping: number;

	/**
	 * 侵入を解決する力のスケール。
	 *
	 * 大きくすると、物体が交差した時、より強く反発する。
	 */
	betaScale: number;

	/**
	 * 物体の形状。
	 */
	shape: Shape;

	/**
	 * 開発者が自由に利用できるプロパティ。
	 */
	userData: unknown;

	/**
	 * 物体の姿勢に関する情報。
	 *
	 * この物理エンジンが内部的に用いるプロパティ。開発者は参照してはならない。
	 */
	_transform: Transform;

	/**
	 * コンストラクタ。
	 *
	 * @param param コンストラクタパラメタオブジェクト。
	 */
	constructor(param: BodyParameterObject) {
		this.mass = param.mass;
		this.invMass = param.mass !== 0 ? 1 / param.mass : 0;
		this.momentOfInertia = param.momentOfInertia;
		this.invI = param.momentOfInertia !== 0 ? 1 / param.momentOfInertia : 0;
		this.position = new Vec2(param.position);
		this.angle = param.angle ?? 0;
		this.velocity = new Vec2(param.velocity);
		this.angularVelocity = param.angularVelocity ?? 0;
		this.force = new Vec2(param.force);
		this.torque = param.torque ?? 0;
		this.restitution = param.restitution ?? 1;
		this.mu = param.mu ?? 1;
		this.linearDamping = param.linearDamping ?? 0;
		this.angularDamping = param.angularDamping ?? 0;
		this.betaScale = param.betaScale ?? 1;
		this.shape = param.shape;
		this.userData = param.userData;

		this._transform = Transform.makeWithAnglePosition(this.angle, this.position);
	}

	/**
	 * 撃力を加える。
	 *
	 * @param r 撃力を与える位置。重心からの相対座標。
	 * @param p 撃力。
	 */
	applyImpulse(r: Vec2Like, p: Vec2Like): void {
		this.velocity.x += p.x * this.invMass;
		this.velocity.y += p.y * this.invMass;
		this.angularVelocity += Vec2.cross(r, p) * this.invI;
	}

	/**
	 * 重心に撃力を加える。
	 *
	 * 重心に撃力を加えるので回転しない。
	 *
	 * @param p
	 */
	applyImpulseToCenter(p: Vec2Like): void {
		this.velocity.add(new Vec2(p).scale(this.invMass));
	}

	/**
	 * 角速度を変化させる撃力を加える。
	 * @param impulse
	 */
	applyAngularImpulse(impulse: number): void {
		this.angularVelocity += impulse * this.invI;
	}

	/**
	 * 物体に力を加える。
	 *
	 * @param r 力を与える位置。重心からの相対座標。
	 * @param f 力。
	 */
	applyForce(r: Vec2Like, f: Vec2Like): void {
		this.force.add(f);
		this.torque += Vec2.cross(r, f);
	}

	/**
	 * 重心に力を加える。
	 *
	 * @param f 力。
	 */
	applyForceToCenter(f: Vec2Like): void {
		this.force.add(f);
	}

	/**
	 * トルクを加える。
	 *
	 * @param torque トルク。
	 */
	applyTorque(torque: number): void {
		this.torque += torque;
	}

	/**
	 * 物体内部の位置のワールド速度を求める。
	 *
	 * @param r 物体内部の位置。重心からの相対座標。
	 * @returns ワールド速度。
	 */
	getVelocityAt(r: Vec2Like): Vec2Like {
		return {
			x: this.velocity.x - this.angularVelocity * r.y,
			y: this.velocity.y + this.angularVelocity * r.x
		}
	}

	/**
	 * Transformの更新。
	 *
	 * この物理エンジンが内部的に用いる機能。開発者は利用してはならない。
	 */
	_updateTransform(): void {
		this._transform.rotation.setAngle(this.angle);
		this._transform.position.copy(this.position)
	}
}
