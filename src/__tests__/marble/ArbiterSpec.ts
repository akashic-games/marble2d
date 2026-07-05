import { Vec2Like, clamp } from "../../math";
import { Arbiter, applyImpulse, createArbiterIfContacts, crossCross } from "../../marble/Arbiter";
import { Body } from "../../marble/Body";
import { CircleShape } from "../../marble/CircleShape";
import { Contact } from "../../marble/Contact";
import * as ref from "../reference";

// https://github.com/akashic-games/akashic-engine/blob/main/src/Xorshift.ts
class Xorshift {
	private _state0U: number;
	private _state0L: number;
	private _state1U: number;
	private _state1L: number;

	constructor(seed: number | [number, number, number, number]) {
		const seeds = Array.isArray(seed) ? seed : this.generateSeeds(seed);

		this._state0U = seeds[0] | 0;
		this._state0L = seeds[1] | 0;
		this._state1U = seeds[2] | 0;
		this._state1L = seeds[3] | 0;
	}

	initState(seed: number): void {
		const seeds = this.generateSeeds(seed);
		this._state0L = seeds[0] | 0;
		this._state0U = seeds[1] | 0;
		this._state1L = seeds[2] | 0;
		this._state1U = seeds[3] | 0;
	}

	randomInt(): [number, number] {
		let s1U = this._state0U;
		let s1L = this._state0L;
		const s0U = this._state1U;
		const s0L = this._state1L;

		const sumL = (s0L >>> 0) + (s1L >>> 0);
		const resU = (s0U + s1U + ((sumL / 2) >>> 31)) >>> 0;
		const resL = sumL >>> 0;

		this._state0U = s0U;
		this._state0L = s0L;

		let t1U = 0;
		let t1L = 0;
		let t2U = 0;
		let t2L = 0;

		const a1 = 23;
		const m1 = 0xffffffff << (32 - a1);
		t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
		t1L = s1L << a1;
		s1U = s1U ^ t1U;
		s1L = s1L ^ t1L;

		t1U = s1U ^ s0U;
		t1L = s1L ^ s0L;

		const a2 = 18;
		const m2 = 0xffffffff >>> (32 - a2);
		t2U = s1U >>> a2;
		t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
		t1U = t1U ^ t2U;
		t1L = t1L ^ t2L;

		const a3 = 5;
		const m3 = 0xffffffff >>> (32 - a3);
		t2U = s0U >>> a3;
		t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
		t1U = t1U ^ t2U;
		t1L = t1L ^ t2L;

		this._state1U = t1U;
		this._state1L = t1L;

		return [resU, resL];
	}

	random(): number {
		const t2 = this.randomInt();
		return t2[0] * 2.3283064365386963e-10 + (t2[1] >>> 12) * 2.220446049250313e-16;
	}

	nextInt(min: number, sup: number): number {
		return Math.floor(min + this.random() * (sup - min));
	}

	private generateSeeds(seed: number): [number, number, number, number] {
		const factor = 1812433253;
		seed = factor * (seed ^ (seed >> 30)) + 1;
		const seed1 = seed;
		seed = factor * (seed ^ (seed >> 30)) + 2;
		const seed2 = seed;
		seed = factor * (seed ^ (seed >> 30)) + 3;
		const seed3 = seed;
		seed = factor * (seed ^ (seed >> 30)) + 4;
		const seed4 = seed;
		return [seed1, seed2, seed3, seed4];
	}
}

function randomVec2(rnd: Xorshift): Vec2Like {
    return {
        x: rnd.random() * 100,
        y: rnd.random() * 100
    };
}

function createBodies(): [Body, Body] {
    const mass = 1;
    const momentOfInertia = 250;
    const restitution = 0.3;
    const mu = 0.99;
    const linearDamping = 0.1;
    const angularDamping = 0.1;

    // 剛体を生成する。
    const shape = new CircleShape(10);
    const bodyA = new Body({
        position: { x: 9, y: 0 },
        mass,
        momentOfInertia,
        restitution,
        mu,
        linearDamping,
        angularDamping,
        shape
    });
    const bodyB = new Body({
        position: { x: -9, y: 0 },
        mass,
        momentOfInertia,
        restitution,
        mu,
        linearDamping,
        angularDamping,
        shape
    });

    return [bodyA, bodyB];
}

describe("crossCross", () => {
    it("is equivalent to ref.crossCross", () => {
        const rnd = new Xorshift(1);

        for (let i = 0; i < 1000; i++) {
            const v1 = randomVec2(rnd);
            const v2 = randomVec2(rnd);
            const v3 = randomVec2(rnd);

            const a1 = ref.crossCross(v1, v2, v3);
            const b1 = crossCross(v1, v2, v3);

            expect(a1.x).toEqual(b1.x);
            expect(a1.y).toEqual(b1.y);
        }
    });

    it("runs faster", () => {
        const rnd = new Xorshift(1);

        const v1 = randomVec2(rnd);
        const v2 = randomVec2(rnd);
        const v3 = randomVec2(rnd);
        const numIteration = 1000000;

        let now: number;

        // リファレンス実装
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            const a1 = ref.crossCross(v1, v2, v3);
        }
        const elapsed1 = performance.now() - now;

        // 現在の実装
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            const a1 = crossCross(v1, v2, v3);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref.crossCross vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Arbiter.preStep", () => {
    it("is equivalent to ref.Arbiter.preStep", () => {
        const [bodyA, bodyB] = createBodies();
        const arbiter1 = new ref.Arbiter(bodyA, bodyB);
        const arbiter2 = createArbiterIfContacts(bodyA, bodyB)!;

        expect(arbiter2.contacts.length).toEqual(arbiter1.contacts.length);
        expect(arbiter2.contacts[0].mass).toEqual(arbiter1.contacts[0].mass);
        expect(arbiter2.contacts[0].separation).toEqual(arbiter1.contacts[0].separation);

        arbiter1.preStep(30);
        arbiter2.preStep(30);

        expect(arbiter2.contacts[0].kn).toEqual(arbiter1.contacts[0].kn);
        expect(arbiter2.contacts[0].kt).toEqual(arbiter1.contacts[0].kt);
    });

    it("runs faster", () => {
        const [bodyA, bodyB] = createBodies();
        const arbiter1 = new ref.Arbiter(bodyA, bodyB);
        const arbiter2 = createArbiterIfContacts(bodyA, bodyB)!;
        const numIteration = 100000;

        let now: number;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            arbiter1.preStep(30);
        }
        const elapsed1 = performance.now() - now;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            arbiter2.preStep(30);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Arbiter.preStep vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });

    it("runs faster with expanded equation", () => {
        const rnd = new Xorshift(1);

        const n = randomVec2(rnd);
        const ra = randomVec2(rnd);
        const rb = randomVec2(rnd);
        const bodyAInvI = rnd.random();
        const bodyBInvI = rnd.random();

        const cca = ref.crossCross(ra, n, ra);
        const ccb = ref.crossCross(rb, n, rb);

        const numIteration = 100000;

        let now: number;

        // リファレンス実装
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.Vec3.dot(
                ref.Vec3.add(
                    ref.Vec3.scale(cca, bodyAInvI),
                    ref.Vec3.scale(ccb, bodyBInvI)
                ),
                { ...n, z: 0 }
            );
        }
        const elapsed1 = performance.now() - now;

        // 現在の実装
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            const x = cca.x * bodyAInvI + ccb.x * bodyBInvI;
            const y = cca.y * bodyAInvI + ccb.y * bodyBInvI;
            const _ = x * n.x + y * n.y;
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Arbiter.preStep plain equation vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Arbiter.applyImpulse", () => {
    it("is equivalent to ref.Arbiter.applyImpulse", () => {
        const apply = (applyer: (c: Contact) => void): Contact => {
            const [bodyA, bodyB] = createBodies();
            const dt = 1 / 30;
            const arbiter = createArbiterIfContacts(bodyA, bodyB)!;

            arbiter.preStep(1 / dt);

            const contact = arbiter.contacts[0];

            expect(contact).toBeDefined();

            applyer(contact);

            return contact;
        };

        const contact1 = apply(ref.applyImpulse);
        const contact2 = apply(applyImpulse);

        expect(contact1.bodyA.position.x).toEqual(contact2.bodyA.position.x);
        expect(contact1.bodyA.position.y).toEqual(contact2.bodyA.position.y);
        expect(contact1.bodyA.angularVelocity).toEqual(contact2.bodyA.angularVelocity);
        expect(contact1.bodyB.position.x).toEqual(contact2.bodyB.position.x);
        expect(contact1.bodyB.position.y).toEqual(contact2.bodyB.position.y);
        expect(contact1.bodyB.angularVelocity).toEqual(contact2.bodyB.angularVelocity);
    });

    it("runs faster", () => {
        const [bodyA, bodyB] = createBodies();
        const bodyAPos = bodyA.position.clone();
        const bodyBPos = bodyB.position.clone();
        const bodyAVel = bodyA.velocity.clone();
        const bodyBVel = bodyB.velocity.clone();
        const bodyAAV = bodyA.angularVelocity;
        const bodyBAV = bodyB.angularVelocity;
        const dt = 1 / 30;
        const arbiter = createArbiterIfContacts(bodyA, bodyB)!;

        arbiter.preStep(1 / dt);

        const contact = arbiter.contacts[0];

        const numIteration = 100000;

        let now: number;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.applyImpulse(contact);
            // 状態を戻す。
            contact.bodyA.position.copy(bodyAPos);
            contact.bodyB.position.copy(bodyBPos);
            contact.bodyA.velocity.copy(bodyAVel);
            contact.bodyB.velocity.copy(bodyBVel);
            contact.bodyA.angularVelocity = bodyAAV;
            contact.bodyB.angularVelocity = bodyBAV;
        }
        const elapsed1 = performance.now() - now;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            applyImpulse(contact);
            // 状態を戻す。
            contact.bodyA.position.copy(bodyAPos);
            contact.bodyB.position.copy(bodyBPos);
            contact.bodyA.velocity.copy(bodyAVel);
            contact.bodyB.velocity.copy(bodyBVel);
            contact.bodyA.angularVelocity = bodyAAV;
            contact.bodyB.angularVelocity = bodyBAV;
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Arbiter.applyImpulse vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Arbiter.clamp", () => {
    it("is equivalent to ref.Arbiter.clamp", () => {
        expect(clamp(50, -100, 100)).toBe(ref.clamp(50, -100, 100));
        expect(clamp(-150, -100, 100)).toBe(ref.clamp(-150, -100, 100));
        expect(clamp(150, -100, 100)).toBe(ref.clamp(150, -100, 100));
    });

    it("runs faster", () => {

        const numIteration = 100000;

        let now: number;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.clamp(50, -100, 100)
            ref.clamp(150, -100, 100)
            ref.clamp(-150, -100, 100)
        }
        const elapsed1 = performance.now() - now;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            clamp(50, -100, 100)
            clamp(150, -100, 100)
            clamp(-150, -100, 100)
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Arbiter.clamp vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});
