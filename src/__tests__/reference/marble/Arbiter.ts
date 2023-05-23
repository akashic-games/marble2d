import { Vec2, Vec2Like, Vec3, Vec3Like } from "../math";
import { Body } from "./Body";
import {
	collisionCircleVsCircle,
	collisionPolygonVsCircle,
	collisionPolygonVsPolygon,
	Contact
} from "./Contact";

export function clamp(v: number, min: number, max: number): number {
	return Math.min(Math.max(v, min), max);
}

/**
 * v1 x v2 x v3 を計算する。
 *
 * @param v1
 * @param v2
 * @param v3
 * @returns
 */
export function crossCross(v1: Vec2Like, v2: Vec2Like, v3: Vec2Like): Vec3Like {
	return Vec3.cross(
		Vec3.cross({ ...v1, z: 0 }, { ...v2, z: 0 }),
		{ ...v3, z: 0 }
	);
}

export function preStep(invDt: number, contact: Contact): void {
	const baseBeta = 0.2;

	const bodyA = contact.bodyA;
	const bodyB = contact.bodyB;

	const k = bodyA.invMass + bodyB.invMass;
	contact.mass = k !== 0 ? 1 / k : 0;

	if (contact.mass === 0) {
		return;
	}

	const n = contact.normal;
	const ra = new Vec2(contact.pointA).sub(bodyA.position);
	const rb = new Vec2(contact.pointB).sub(bodyB.position);

	// TODO: Vec3.dot() 以下の計算を展開する。
	contact.kn =
		bodyA.invMass + bodyB.invMass +
		Vec3.dot(
			Vec3.add(
				Vec3.scale(crossCross(ra, n, ra), bodyA.invI),
				Vec3.scale(crossCross(rb, n, rb), bodyB.invI)
			),
			{ ...n, z: 0 }
		);

	const t = { x: -n.y, y: n.x };
	contact.kt =
		bodyA.invMass + bodyB.invMass +
		Vec3.dot(
			Vec3.add(
				Vec3.scale(crossCross(ra, t, ra), bodyA.invI),
				Vec3.scale(crossCross(rb, t, rb), bodyB.invI)
			),
			{ ...t, z: 0 }
		);

	const slop = 0.5;
	const beta = baseBeta * bodyA.betaScale * bodyB.betaScale;
	contact.bias = beta * invDt * Math.max(0, -contact.separation - slop);
}

export function applyImpulse(contact: Contact): void {
	const bodyA = contact.bodyA;
	const bodyB = contact.bodyB;
	const e = bodyA.restitution * bodyB.restitution;

	const n = contact.normal;
	const ra = new Vec2(contact.pointA).sub(bodyA.position);
	const rb = new Vec2(contact.pointB).sub(bodyB.position);

	// let dV = bodyB.getVelocityAt(rb).sub(bodyA.getVelocityAt(ra));
	let dV = bodyB.getVelocityAt(rb);
	Vec2.sub(dV, bodyA.getVelocityAt(ra));

	// const dPn = (dV.dot(n) * (-1 - e) + contact.bias) / contact.kn;
	const dPn = (Vec2.dot(dV, n) * (-1 - e) + contact.bias) / contact.kn;

	if (dPn <= 0) {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const Pn = new Vec2(n).scale(dPn);
	bodyA.applyImpulse(ra, Pn.clone().scale(-1));
	bodyB.applyImpulse(rb, Pn);

	// dV = bodyB.getVelocityAt(rb).sub(bodyA.getVelocityAt(ra));
	dV = bodyB.getVelocityAt(rb);
	Vec2.sub(dV, bodyA.getVelocityAt(ra));

	const mu = (bodyA.mu + bodyB.mu) / 2;
	const t = { x: -n.y, y: n.x };
	// const dPt = clamp(-dV.dot(t) / contact.kt, -mu * dPn, mu * dPn);
	const dPt = clamp(-Vec2.dot(dV, t) / contact.kt, -mu * dPn, mu * dPn);

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const Pt = new Vec2(t).scale(dPt);
	bodyA.applyImpulse(ra, Pt.clone().scale(-1));
	bodyB.applyImpulse(rb, Pt);
}

export class Arbiter {
	contacts: Contact[];

	constructor(bodyA: Body, bodyB: Body) {
		this.contacts = [];

		const shapeA = bodyA.shape;
		const shapeB = bodyB.shape;

		if (shapeA.type === "circle" && shapeB.type === "circle") {
			const contact = collisionCircleVsCircle(bodyA, bodyB);
			if (contact) {
				this.contacts.push(contact);
			}
		} else if (shapeA.type === "polygon" && shapeB.type === "circle") {
			const contact = collisionPolygonVsCircle(bodyA, bodyB);
			if (contact) {
				this.contacts.push(contact);
			}
		} else if (shapeA.type === "circle" && shapeB.type === "polygon") {
			const contact = collisionPolygonVsCircle(bodyB, bodyA);
			if (contact) {
				this.contacts.push(contact);
			}
		} else if (shapeA.type === "polygon" && shapeB.type === "polygon") {
			const contacts = collisionPolygonVsPolygon(bodyA, bodyB);
			if (contacts) {
				for (const contact of contacts) {
					this.contacts.push(contact);
				}
			}
		}
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
