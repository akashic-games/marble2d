import { Vec2, Vec2Like } from "../math";
import { Shape } from "./Shape";

/**
 * ポリゴンシェイプ。
 *
 * 凸多角形のみサポートします。
 */
export class PolygonShape implements Shape {
    type: "polygon" = "polygon";

    _bounds: number;

    localVertices: Vec2[];
    localNormals: Vec2[];

    /**
     * 矩形の PolygonShape を生成する。
     *
     * @param width 矩形の幅。
     * @param height 矩形の高さ。
     * @returns ポリゴンシェイプ。
     */
    static createRect(width: number, height: number): PolygonShape {
        const hw = width / 2;
        const hh = height / 2;
        return new PolygonShape([
            { x: -hw, y: -hh },
            { x: +hw, y: -hh },
            { x: +hw, y: +hh },
            { x: -hw, y: +hh }
        ]);
    }

    /**
     * コンストラクタ。
     *
     * 凸多角形のみサポートします。
     *
     * @param vertices 多角形の頂点。頂点は時計回転に並べなければならない。
     */
    constructor(vertices: Vec2Like[]) {
        this.localVertices = vertices.map(v => new Vec2(v));

        this.localNormals = [];

        this._bounds = 0;
        for (let i = 0; i < this.localVertices.length; i++) {
            const v1 = this.localVertices[i];
            const v2 = this.localVertices[(i + 1) % this.localVertices.length];
            const n = v2.clone().sub(v1).normal();
            this.localNormals.push(n);

            const radius = v1.length();
            if (radius > this._bounds) {
                this._bounds = radius;
            }
        }
    }
}
