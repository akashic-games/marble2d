import { Vec2 as Vec2_, Vec2Like, clamp as clamp_ } from "../math";
import { Body } from "./Body";
import {
	collisionCircleVsCircle,
	collisionPolygonVsCircle,
	collisionPolygonVsPolygon,
	Contact
} from "./Contact";

// import した値をそのまま使うと TS のビルド方法によっては都度 getter 経由のアクセスになって遅い。
// そのためアクセス頻度の高い値をローカルで定義する。
type Vec2 = Vec2_;
const Vec2 = Vec2_;
const clamp = clamp_;

/**
 * v1 x v2 x v3 を計算する。
 *
 * 物理エンジンが内部的に利用する。開発者はこれを利用してはならない。
 *
 * @param v1
 * @param v2
 * @param v3
 * @returns
 */
export function crossCross(v1: Vec2Like, v2: Vec2Like, v3: Vec2Like): Vec2Like {
	// // v4 = v1 x v2
	// const v4x = 0; // v1.y * 0 - 0 * v2.y;
	// const v4y = 0; // 0 * v2.x - v1.x * 0;
	// const v4z = v1.x * v2.y - v1.y * v2.x;

	// // v5 = v4 x v3
	// const v5x = -v4z * v3.y; // 0 * 0 - v4z * v3.y;
	// const v5y = v4z * v3.x; // v4z * v3.x - 0 * 0;
	// const v5z = 0; // 0 * v3.y - 0 * v3.x;

	const z = v1.x * v2.y - v1.y * v2.x;
	return {
		x: -z * v3.y,
		y: z * v3.x,
	};
}

/**
 * 事前計算。
 *
 * 物理エンジンが内部的に利用する。開発者はこれを利用してはならない。
 *
 * @param invDt
 * @param contact
 * @returns
 */
export function preStep(invDt: number, contact: Contact): void {
	const bodyA = contact.bodyA;
	const bodyB = contact.bodyB;

	const k = bodyA.invMass + bodyB.invMass;
	contact.mass = k !== 0 ? 1 / k : 0;

	if (contact.mass === 0) {
		return;
	}

	const n = contact.normal;
	const ra = { x: contact.pointA.x - bodyA.position.x, y: contact.pointA.y - bodyA.position.y };
	const rb = { x: contact.pointB.x - bodyB.position.x, y: contact.pointB.y - bodyB.position.y };

	{
		const cca = crossCross(ra, n, ra);
		const ccb = crossCross(rb, n, rb);

		// invMassA + invMassB + ((cca * invIA + ccb * invIB) dot n)
		const x = cca.x * bodyA.invI + ccb.x * bodyB.invI;
		const y = cca.y * bodyA.invI + ccb.y * bodyB.invI;
		contact.kn = bodyA.invMass + bodyB.invMass + x * n.x + y * n.y;
	}

	{
		const t = { x: -n.y, y: n.x };
		const cca = crossCross(ra, t, ra);
		const ccb = crossCross(rb, t, rb);

		const x = cca.x * bodyA.invI + ccb.x * bodyB.invI;
		const y = cca.y * bodyA.invI + ccb.y * bodyB.invI;
		contact.kt = bodyA.invMass + bodyB.invMass + x * t.x + y * t.y;
	}

	// bias: 侵入の程度に応じた撃力の補正。
	const baseBeta = 0.2;
	const beta = baseBeta * bodyA.betaScale * bodyB.betaScale;
	const slop = 0.5;
	contact.bias = beta * invDt * Math.max(0, -contact.separation - slop);
}

/**
 * 撃力を加える。
 *
 * 物理エンジンが内部的に利用する。開発者はこれを利用してはならない。
 *
 * @param contact
 * @returns
 */
export function applyImpulse(contact: Contact): void {
	const bodyA = contact.bodyA;
	const bodyB = contact.bodyB;
	const e = bodyA.restitution * bodyB.restitution;

	const n = contact.normal;
	const ra = {
		x: contact.pointA.x - bodyA.position.x,
		y: contact.pointA.y - bodyA.position.y,
	};
	const rb = {
		x: contact.pointB.x - bodyB.position.x,
		y: contact.pointB.y - bodyB.position.y,
	};

	let dV = bodyB.getVelocityAt(rb);
	Vec2.sub(dV, bodyA.getVelocityAt(ra));

	const dPn = (Vec2.dot(dV, n) * (-1 - e) + contact.bias) / contact.kn;

	if (dPn <= 0) {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const Pn = {
		x: n.x * dPn,
		y: n.y * dPn
	};
	bodyA.applyImpulse(ra, { x: Pn.x * -1, y: Pn.y * -1 });
	bodyB.applyImpulse(rb, Pn);

	dV = bodyB.getVelocityAt(rb);
	Vec2.sub(dV, bodyA.getVelocityAt(ra));

	const mu = (bodyA.mu + bodyB.mu) / 2;
	const t = { x: -n.y, y: n.x };
	const dPt = clamp(-Vec2.dot(dV, t) / contact.kt, -mu * dPn, mu * dPn);

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const Pt = {
		x: t.x * dPt,
		y: t.y * dPt
	};
	bodyA.applyImpulse(ra, { x: Pt.x * -1, y: Pt.y * -1 });
	bodyB.applyImpulse(rb, Pt);
}

declare function neverReach(x: never): never;

export function createArbiterIfContacts(bodyA: Body, bodyB: Body): Arbiter | null {
	const typeA = bodyA.shape.type;
	const typeB = bodyB.shape.type;

	switch (typeA) {
		case "circle": {
			switch (typeB) {
				case "circle": {
					const contact = collisionCircleVsCircle(bodyA, bodyB);
					return contact ? new Arbiter([contact]) : null;
				}
				case "polygon": {
					const contact = collisionPolygonVsCircle(bodyB, bodyA);
					return contact ? new Arbiter([contact]) : null;
				}
				default: {
					neverReach(typeB);
				}
			}
		}
		case "polygon": {
			switch (typeB) {
				case "circle": {
					const contact = collisionPolygonVsCircle(bodyA, bodyB);
					return contact ? new Arbiter([contact]) : null;
				}
				case "polygon": {
					const contacts = collisionPolygonVsPolygon(bodyA, bodyB);
					return (contacts && contacts.length > 0) ? new Arbiter(contacts) : null;
				}
				default: {
					neverReach(typeB);
				}
			}
		}
		default: {
			neverReach(typeA);
		}
	}
}

/**
 * 剛体の接触の解決役。
 *
 * 物理エンジンが内部的に利用する。開発者が直接このクラスを利用する必要はない。
 */
export class Arbiter {
	/**
	 * 接触情報の配列。
	 */
	contacts: Contact[];

	constructor(contacts: Contact[]) {
		this.contacts = contacts;
	}

	preStep(invDt: number): void {
		for (let i = 0; i < this.contacts.length; i++) {
			preStep(invDt, this.contacts[i]);
		}
	}

	applyImpulse(): void {
		for (let i = 0; i < this.contacts.length; i++) {
			const contact = this.contacts[i];
			if (contact.mass === 0) {
				continue;
			}

			applyImpulse(contact);
		}
	}
}
