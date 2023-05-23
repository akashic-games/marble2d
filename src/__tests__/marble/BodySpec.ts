import { Body } from "../../marble/Body";
import { CircleShape } from "../../marble/CircleShape";
import * as ref from "../reference";

function createBodies(): [ref.Body, Body] {
    const mass = 1;
    const momentOfInertia = 250;
    const restitution = 0.3;
    const mu = 0.99;
    const linearDamping = 0.1;
    const angularDamping = 0.1;

    const shapeA = new ref.CircleShape(10);
    const bodyA = new ref.Body({
        position: { x: 0, y: 0 },
        mass,
        momentOfInertia,
        restitution,
        mu,
        linearDamping,
        angularDamping,
        shape: shapeA
    });

    const shapeB = new CircleShape(10);
    const bodyB = new Body({
        position: { x: 0, y: 0 },
        mass,
        momentOfInertia,
        restitution,
        mu,
        linearDamping,
        angularDamping,
        shape: shapeB
    });

    return [bodyA, bodyB];
}

describe("Body.applyImpulse", () => {
    it("is equivalent to ref.Body.applyImpulse", () => {
        const [bodyA, bodyB] = createBodies();

        const r = { x: 4, y: 5 };
        const p = { x: -5, y: 4 };

        bodyA.applyImpulse(r, p);
        bodyB.applyImpulse(r, p);

        expect(bodyB.velocity.x).toEqual(bodyA.velocity.x);
        expect(bodyB.velocity.y).toEqual(bodyA.velocity.y);
        expect(bodyB.angularVelocity).toEqual(bodyA.angularVelocity);
    });

    it("runs faster", () => {
        const [bodyA, bodyB] = createBodies();
        const r = { x: 4, y: 5 };
        const p = { x: -5, y: 4 };
        const numIteration = 100_000_000;

        let now: number;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            bodyA.applyImpulse(r, p);
        }
        const elapsed1 = performance.now() - now;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            bodyB.applyImpulse(r, p);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Body.applyImpulse vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Body.getVelocityAt", () => {
    it("is equivalent to ref.Body.getVelocityAt", () => {
        const [bodyA, bodyB] = createBodies();
        const r = { x: -5, y: -10 };

        bodyA.velocity.x = 10;
        bodyA.velocity.y = -15;
        bodyA.angularVelocity = Math.PI / 30;
        const va = bodyA.getVelocityAt(r);

        bodyB.velocity.x = 10;
        bodyB.velocity.y = -15;
        bodyB.angularVelocity = Math.PI / 30;
        const vb = bodyB.getVelocityAt(r);

        expect(vb.x).toEqual(va.x);
        expect(vb.y).toEqual(va.y);
    });

    it("runs faster", () => {
        const [bodyA, bodyB] = createBodies();
        const r = { x: -5, y: -10 };
        const numIteration = 100_000_000;

        bodyA.velocity.x = 10;
        bodyA.velocity.y = -15;
        bodyA.angularVelocity = Math.PI / 30;

        bodyB.velocity.x = 10;
        bodyB.velocity.y = -15;
        bodyB.angularVelocity = Math.PI / 30;

        let now: number;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            bodyA.getVelocityAt(r);
        }
        const elapsed1 = performance.now() - now;

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            bodyB.getVelocityAt(r);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Body.getVelocityAt vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});
