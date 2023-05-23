import { Transform } from "../../math";
import { Vec2Like } from "../reference";

describe("Transform.mulVec", () => {
    it("runs faster if expand", () => {
        const numIteration = 100000000;

        const transform = Transform.makeWithAnglePosition(Math.PI / 6, { x: 2, y: 3 });

        let v: Vec2Like;

        let now: number;

        // 元の実装。
        v = { x: 1, y: 2 };
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            transform.mulVec(v);
        }
        const elapsed1 = performance.now() - now;

        // 改善案。関数を展開。
        v = { x: 1, y: 2 };
        now = performance.now();
        for (let i = 0; i < numIteration; i++) {
            const x = transform.rotation.c * v.x - transform.rotation.s * v.y;
            const y = transform.rotation.s * v.x + transform.rotation.c * v.y;
            v.x = x + transform.position.x;
            v.y = y + transform.position.y;
        }
        const elapsed2 = performance.now() - now;

        console.log(`ref Transform.mulVec vs our idea = ${elapsed2 / elapsed1 * 100} %`);

        expect(elapsed2).toBeLessThan(elapsed1);
    });
});
