import { Vec2, Vec2Like } from "../math";
import { Shape } from "./Shape";

export class PolygonShape implements Shape {
    type: "polygon" = "polygon";

    localVertices: Vec2[];
    localNormals: Vec2[];

    constructor(vertices: Vec2Like[]) {
        this.localVertices = vertices.map(v => new Vec2(v));

        this.localNormals = [];
        for (let i = 0; i < this.localVertices.length; i++) {
            const v1 = this.localVertices[i];
            const v2 = this.localVertices[(i + 1) % this.localVertices.length];
            const n = v2.clone().sub(v1).normal();
            this.localNormals.push(n);
        }
    }
}
