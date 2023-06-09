import { Vec2 } from "../../math";

describe("Vec2", () => {
    it("constructs with x and y value", () => {
        const v = new Vec2(1, 2);
        expect(v.x).toEqual(1);
        expect(v.y).toEqual(2);
    });

    it("constructs with Vector2Like", () => {
        const v = new Vec2({ x: 1, y: 2 });
        expect(v.x).toEqual(1);
        expect(v.y).toEqual(2);
    });

    it("constructs zero vector without arguments", () => {
        const v = new Vec2();
        expect(v.x).toEqual(0);
        expect(v.y).toEqual(0);
    });

    it("clones", () => {
        const v = new Vec2(1, 2);
        const w = v.clone();
        expect(v.x).toEqual(w.x);
        expect(v.y).toEqual(w.y);
    });

    it("compares", () => {
        const v = new Vec2(1, 2);
        expect(v.equal({ x: 1, y: 2 })).toBeTruthy();
    });

    it("adds", () => {
        const v = new Vec2(1, 2);
        v.add({ x: 1, y: 2 });
        expect(v.x).toEqual(2);
        expect(v.y).toEqual(4);
    });

    it("subs", () => {
        const v = new Vec2(2, 4);
        v.sub({ x: 1, y: 2 });
        expect(v.x).toEqual(1);
        expect(v.y).toEqual(2);
    });

    it("scales", () => {
        const v = new Vec2(1, 2);
        v.scale(2);
        expect(v.x).toEqual(2);
        expect(v.y).toEqual(4);
    });

    it("dots", () => {
        const v = new Vec2(1, 2);
        expect(v.dot({ x: 2, y: 4 })).toEqual(10);
    });

    it("crosses", () => {
        expect(new Vec2(1, 0).dot({ x: 0, y: 1 })).toEqual(0);
    });

    it("calculates squared length", () => {
        const v = new Vec2(1, 2);
        expect(v.squaredLength()).toEqual(5);
    });

    it("calculates length", () => {
        const v = new Vec2(3, 4);
        expect(v.length()).toEqual(5);
    });

    it("normalizes", () => {
        const v = new Vec2(3, 4);
        v.normalize();
        expect(v.x).toEqual(3 / 5);
        expect(v.y).toEqual(4 / 5);
    });

    it("rotates", () => {
        const v = new Vec2(1, 2);
        v.rotate(Math.PI / 2);
        expect(v.x).toBeCloseTo(-2, 5);
        expect(v.y).toBeCloseTo(1, 5);
    });

    it("dots 2 Vec2Likes", () => {
        expect(Vec2.dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toEqual(0);
    });

    it("crosses 2 Vec2Likes", () => {
        expect(Vec2.cross({ x: 1, y: 0 }, { x: 0, y: 1 })).toEqual(1);
    });

    it("runs faster if optimized (ctor)", () => {
        const numIteration = 10000000;

        const v = { x: 1, y: 2 };

        let now: number;

        // 元の実装。Vec2を生成。
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            const _ = new Vec2(v);
        }
        const elapsed1 = performance.now() - now;

        // 改善案。Vec2Likeを生成。
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            const _ = { x: v.x, y: v.y };
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Vec2 ctor vs our idea = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});
