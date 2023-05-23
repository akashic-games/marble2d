import { Vec2, Vec2Like } from "../math";
import { Arbiter } from "./Arbiter";
import { Body } from "./Body";

/**
 * ワールドコンストラクタパラメータオブジェクト。
 */
export interface WorldParameterObject {
	/**
	 *  重力加速度。
	 *
	 * 省略時 { x: 0, y: 600 } 。
	 */
	gravity?: Vec2Like;

	/**
	 * シミュレーションの反復回数。
	 *
	 * 反復回数を大きくすると良い結果が得られるが、計算時間も大きくなる。
	 *
	 * 省略したとき 4 。
	 */
	subStep?: number;

	/**
	 * 物体の接触状態を解決する反復回数。
	 *
	 * 反復回数を大きくすると良い結果が得られるが、計算時間も大きくなる。
	 *
	 * 省略した時 4 。
	 */
	iteration?: number;

	/**
	 *  剛体。
	 */
	bodies?: Body[];
}

/**
 * ワールドクラス。
 */
export class World {
	/**
	 * 重力加速度。
	 */
	gravity: Vec2;

	/**
	 * シミュレーションの反復回数。
	 *
	 * 反復回数を大きくすると良い結果が得られるが、計算時間も大きくなる。
	 */
	subStep: number;

	/**
	 * 接触状態を解決する反復回数。
	 *
	 * 反復回数を大きくすると良い結果が得られるが、計算時間も大きくなる。
	 */
	iteration: number;

	/**
	 * シミュレーションされる剛体。
	 *
	 * 参照用。
	 */
	bodies: (Body | null)[];

	/**
	 * アービター。
	 *
	 * 剛体の接触情報を保持している。
	 */
	arbiters: Arbiter[];

	/**
	 * コンストラクタ。
	 *
	 * @param param コンストラクタパラメタ。
	 */
	constructor(param: WorldParameterObject = {}) {
		this.gravity = new Vec2(param.gravity ?? { x: 0, y: 600 });

		this.subStep = param.subStep ?? 4;
		this.iteration = param.iteration ?? 4;

		this.bodies = param.bodies ?? [];

		this.arbiters = [];
	}

	/**
	 * 剛体の追加。
	 *
	 * @param body 剛体。
	 */
	addBody(body: Body): void {
		this.bodies.push(body);
	}

	/**
	 * 剛体の削除。
	 *
	 * @param body 剛体。
	 */
	removeBody(body: Body): void {
		const index = this.bodies.indexOf(body);
		if (index !== -1) {
			this.bodies[index] = null;
		}
	}

	/**
	 * シミュレーションを進める。
	 *
	 * @param dt 経過時間。
	 */
	step(dt: number): void {
		this.flush();

		const subStep = this.subStep;
		const subDt = dt / subStep;

		for (let i = 0; i < subStep; i++) {
			this.checkCollision();
			this.integrateForces(subDt);
			this.preStep(subDt);
			this.applyImpulse();
			this.integrateVelocity(subDt);
		}

		// substep の外で外力をクリアする。つまり外力は step の間常に作用している。
		this.clearForces();
	}

	/**
	 * bodies 配列中の null を取り除いて詰める。
	 */
	private flush(): void {
		this.bodies = this.bodies.filter(o => !!o);
	}

	private checkCollision(): void {
		// flush() 済みであることを期待している。
		const bodies = this.bodies as Body[];

		// Arbiter による交差判定のための事前計算。
		for (const body of bodies) {
			body._updateTransform();
		}

		const arbiters: Arbiter[] = [];

		// このループ内で bodies 配列の要素が null であるか確認することを避ける。
		// 剛体が多い時、処理時間に大きく影響する。
		for (let i = 0; i < bodies.length - 1; i++) {
			const bodyA = bodies[i];
			for (let j = i + 1; j < this.bodies.length; j++) {
				const bodyB = bodies[j];
				const arbiter = new Arbiter(bodyA, bodyB);
				if (arbiter.contacts.length > 0) {
					arbiters.push(arbiter);
				}
			}
		}

		this.arbiters = arbiters;
	}

	private integrateForces(dt: number): void {
		const force = new Vec2();

		for (let i = 0; i < this.bodies.length; i++) {
			const body = this.bodies[i]!;

			if (body.invMass === 0) {
				continue;
			}

			force.copy(this.gravity)
				.scale(body.mass)
				.add(body.force)
				.scale(body.invMass * dt);

			body.velocity.add(force);
			body.angularVelocity += body.torque * body.invI * dt;
		}
	}

	private clearForces(): void {
		for (let i = 0; i < this.bodies.length; i++) {
			const body = this.bodies[i]!;
			body.force.copy(Vec2.zero);
			body.torque = 0;
		}
	}

	private preStep(dt: number): void {
		for (let i = 0; i < this.arbiters.length; i++) {
			this.arbiters[i].preStep(1 / dt);
		}
	}

	private applyImpulse(): void {
		const iteration = this.iteration;
		for (let i = 0; i < iteration; i++) {
			for (let j = 0; j < this.arbiters.length; j++) {
				this.arbiters[j].applyImpulse();
			}
		}
	}

	private integrateVelocity(dt: number): void {
		for (let i = 0; i < this.bodies.length; i++) {
			const body = this.bodies[i]!;

			if (body.invMass === 0) {
				continue;
			}

			// 減衰: dv/dt + cv = 0
			// v = v0 * e^(-ct)
			// 近似: v2 = v1 * 1 / (1 + c * dt)
			body.velocity.scale(1.0 / (1.0 + dt * body.linearDamping));
			body.angularVelocity *= 1.0 / (1.0 + dt * body.angularDamping);

			body.position.add(body.velocity.clone().scale(dt));
			body.angle += body.angularVelocity * dt;
		}
	}
}
