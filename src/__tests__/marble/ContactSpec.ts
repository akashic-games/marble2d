import {
    checkSeparation,
    CircleShape,
    clipSegmentToLine,
    collisionCircleVsCircle,
    collisionPolygonVsCircle,
    collisionPolygonVsPolygon,
    findIncidentEdge,
    findMaxSeparation,
    PolygonShape,
    Shape
} from "../../marble/";
import { Body } from "../../marble/Body";
import * as ref from "../reference";
import { Vec2 } from "../reference";

type ShapeType = "rect" | "circle";

function createBodies(st1: ShapeType, st2: ShapeType): [Body, Body] {
    const size = 10;

    const createShape = (st: ShapeType): Shape => {
        if (st === "rect") {
            return new PolygonShape([
                { x: -size / 2, y: -size / 2 },
                { x: +size / 2, y: -size / 2 },
                { x: +size / 2, y: +size / 2 },
                { x: -size / 2, y: +size / 2 }
            ]);
        } else {
            return new CircleShape(size / 2);
        }
    }

    // 剛体を生成する。
    const bodyA = new Body({
        mass: 1,
        momentOfInertia: 0,
        position: { x: -2, y: -1 },
        shape: createShape(st1)
    });

    const bodyB = new Body({
        mass: 1,
        momentOfInertia: 0,
        position: { x: 2, y: 1 },
        shape: createShape(st2)
    });

    return [bodyA, bodyB];
}

describe("Contact.collisionPolygonVsPolygon", () => {
    // findIncidentEdge の変更の影響で collisionPolygonVsPolygon も
    // 変更されている。そのため動作が一致していることを確認する。
    it("is equivalent to ref.Contact.collisionPolygonVsPolygon", () => {
        const [bodyA, bodyB] = createBodies("rect", "rect");

        bodyA._updateTransform();
        bodyB._updateTransform();

        // bodyA, B は必ず交差する。
        const contactsA = ref.collisionPolygonVsPolygon(bodyA, bodyB)!;
        const contactsB = collisionPolygonVsPolygon(bodyA, bodyB)!;

        expect(contactsB.length).toEqual(contactsA.length);

        const contactA = contactsA[0];
        const contactB = contactsB[0];
        expect(contactB.kn).toEqual(contactA.kn);
        expect(contactB.kt).toEqual(contactA.kt);
        expect(contactB.normal.x).toEqual(contactA.normal.x);
        expect(contactB.normal.y).toEqual(contactA.normal.y);
        expect(contactB.pointA.x).toEqual(contactA.pointA.x);
        expect(contactB.pointA.y).toEqual(contactA.pointA.y);
        expect(contactB.pointB.x).toEqual(contactA.pointB.x);
        expect(contactB.pointB.y).toEqual(contactA.pointB.y);
        expect(contactB.separation).toEqual(contactA.separation);
    });
});

describe("Contact.collisionCircleVsCircle", () => {
    // findIncidentEdge の変更の影響で collisionPolygonVsPolygon も
    // 変更されている。そのため動作が一致していることを確認する。
    it("is equivalent to ref.Contact.collisionCircleVsCircle", () => {
        const [bodyA, bodyB] = createBodies("circle", "circle");

        bodyA._updateTransform();
        bodyB._updateTransform();

        // bodyA, B は必ず交差する。
        const contactA = ref.collisionCircleVsCircle(bodyA, bodyB)!;
        const contactB = collisionCircleVsCircle(bodyA, bodyB)!;

        expect(contactB.kn).toEqual(contactA.kn);
        expect(contactB.kt).toEqual(contactA.kt);
        expect(contactB.normal.x).toEqual(contactA.normal.x);
        expect(contactB.normal.y).toEqual(contactA.normal.y);
        expect(contactB.pointA.x).toEqual(contactA.pointA.x);
        expect(contactB.pointA.y).toEqual(contactA.pointA.y);
        expect(contactB.pointB.x).toEqual(contactA.pointB.x);
        expect(contactB.pointB.y).toEqual(contactA.pointB.y);
        expect(contactB.separation).toEqual(contactA.separation);
    });

    it("runs faster", () => {
        const numIteration = 10000000;

        let now: number;

        let [bodyA, bodyB] = createBodies("circle", "circle");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.collisionCircleVsCircle(bodyA, bodyB);
        }
        const elapsed1 = performance.now() - now;

        [bodyA, bodyB] = createBodies("circle", "circle");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            collisionCircleVsCircle(bodyA, bodyB);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Contact.collisionCircleVsCircle vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Contact.collisionPolygonVsCircle", () => {
    it("is equivalent to ref.Contact.collisionPolygonVsCircle", () => {
        const [bodyA, bodyB] = createBodies("rect", "circle");

        bodyA._updateTransform();
        bodyB._updateTransform();

        // bodyA, B は必ず交差する。
        const contactA = ref.collisionPolygonVsCircle(bodyA, bodyB)!;
        const contactB = collisionPolygonVsCircle(bodyA, bodyB)!;

        expect(contactB.kn).toEqual(contactA.kn);
        expect(contactB.kt).toEqual(contactA.kt);
        expect(contactB.normal.x).toEqual(contactA.normal.x);
        expect(contactB.normal.y).toEqual(contactA.normal.y);
        expect(contactB.pointA.x).toEqual(contactA.pointA.x);
        expect(contactB.pointA.y).toEqual(contactA.pointA.y);
        expect(contactB.pointB.x).toEqual(contactA.pointB.x);
        expect(contactB.pointB.y).toEqual(contactA.pointB.y);
        expect(contactB.separation).toEqual(contactA.separation);
    });

    it("runs faster", () => {
        const numIteration = 10000000;

        let now: number;

        let [bodyA, bodyB] = createBodies("rect", "circle");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.collisionPolygonVsCircle(bodyA, bodyB);
        }
        const elapsed1 = performance.now() - now;

        [bodyA, bodyB] = createBodies("rect", "circle");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            collisionPolygonVsCircle(bodyA, bodyB);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Contact.collisionPolygonVsCircle vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Contact.clipSegmentToLine", () => {
    // findIncidentEdge の変更の影響で clipSegmentToLine も
    // 変更されている。そのため動作が一致していることを確認する。
    it("is equivalent to ref.Contact.clipSegmentToLine", () => {
        const [bodyA, bodyB] = createBodies("rect", "rect");

        bodyA._updateTransform();
        bodyB._updateTransform();

        const sep = checkSeparation(bodyA, bodyB)!;

        const clipPointsA = ref.clipSegmentToLine(
            sep.incidentEdges.map(e => new ref.Vec2(e)),
            new Vec2(sep.tangent).scale(-1),
            sep.sideOffset1
        );

        const clipPointsB = clipSegmentToLine(
            sep.incidentEdges,
            new Vec2(sep.tangent).scale(-1),
            sep.sideOffset1
        );

        expect(clipPointsB.length).toBeGreaterThan(0);
        expect(clipPointsB.length).toEqual(clipPointsA.length);

        for (let i = 0; i < clipPointsB.length; i++) {
            expect(clipPointsB[i].x).toEqual(clipPointsA[i].x);
            expect(clipPointsB[i].y).toEqual(clipPointsA[i].y);
        }
    });
});

describe("Contact.findIncidentEdge", () => {
    it("is equivalent to ref.Contact.findIncidentEdge", () => {
        const edgeIndex = 0;
        const [bodyA, bodyB] = createBodies("rect", "rect");

        bodyA._updateTransform();
        bodyB._updateTransform();

        const [va0, va1] = ref.findIncidentEdge(bodyA, bodyB, edgeIndex);
        const [vb0, vb1] = findIncidentEdge(bodyA, bodyB, edgeIndex);

        expect(vb0.x).toEqual(va0.x);
        expect(vb0.y).toEqual(va0.y);
        expect(vb1.x).toEqual(va1.x);
        expect(vb1.y).toEqual(va1.y);
    });

    it("runs faster", () => {
        const edgeIndex = 0;
        const numIteration = 10000000;

        let now: number;

        let [bodyA, bodyB] = createBodies("rect", "rect");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.findIncidentEdge(bodyA, bodyB, edgeIndex);
        }
        const elapsed1 = performance.now() - now;

        [bodyA, bodyB] = createBodies("rect", "rect");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            findIncidentEdge(bodyA, bodyB, edgeIndex);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Contact.findIncidentEdge vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Contact.findMaxSeparation", () => {
    it("is equivalent to ref.Contact.findMaxSeparation", () => {
        const [bodyA, bodyB] = createBodies("rect", "rect");

        bodyA._updateTransform();
        bodyB._updateTransform();

        const infoA = ref.findMaxSeparation(bodyA, bodyB);
        const infoB = findMaxSeparation(bodyA, bodyB);

        expect(infoB.edgeIndex).toEqual(infoA.edgeIndex);
        expect(infoB.separation).toEqual(infoA.separation);
    });

    it("runs faster", () => {
        const numIteration = 10000000;

        let now: number;

        let [bodyA, bodyB] = createBodies("rect", "rect");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.findMaxSeparation(bodyA, bodyB);
        }
        const elapsed1 = performance.now() - now;

        [bodyA, bodyB] = createBodies("rect", "rect");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            findMaxSeparation(bodyA, bodyB);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Contact.findMaxSeparation vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});

describe("Contact.checkSeparation", () => {
    it("is equivalent to ref.Contact.checkSeparation", () => {
        const [bodyA, bodyB] = createBodies("rect", "rect");

        bodyA._updateTransform();
        bodyB._updateTransform();

        const sepA = ref.checkSeparation(bodyA, bodyB)!;
        const sepB = checkSeparation(bodyA, bodyB)!;

        expect(sepB.body1).toBe(sepA.body1)
        expect(sepB.body2).toBe(sepA.body2)
        expect(sepB.separation).toBe(sepA.separation)
        expect(sepB.edgeIndex).toBe(sepA.edgeIndex)
        expect(sepB.incidentEdges.length).toBe(sepA.incidentEdges.length)
        for (let i = 0; i < sepB.incidentEdges.length; i++) {
            expect(sepB.incidentEdges[i].x).toBe(sepA.incidentEdges[i].x);
            expect(sepB.incidentEdges[i].y).toBe(sepA.incidentEdges[i].y);
        }
        expect(sepB.tangent.x).toBe(sepA.tangent.x);
        expect(sepB.tangent.y).toBe(sepA.tangent.y);
        expect(sepB.normal.x).toBe(sepA.normal.x);
        expect(sepB.normal.y).toBe(sepA.normal.y);
        expect(sepB.frontOffset).toBe(sepA.frontOffset);
        expect(sepB.sideOffset1).toBe(sepA.sideOffset1);
        expect(sepB.sideOffset2).toBe(sepA.sideOffset2);
    });

    it("runs faster", () => {
        const numIteration = 1000000;

        let now: number;

        let [bodyA, bodyB] = createBodies("rect", "rect");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            ref.checkSeparation(bodyA, bodyB);
        }
        const elapsed1 = performance.now() - now;

        [bodyA, bodyB] = createBodies("rect", "rect");
        bodyA._updateTransform();
        bodyB._updateTransform();

        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            checkSeparation(bodyA, bodyB);
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Contact.checkSeparation vs ours = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});
