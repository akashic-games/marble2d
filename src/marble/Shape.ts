/**
 * 形状タイプ型。
 */
export type ShapeType = "circle" | "polygon";

/**
 * シェイプ。
 *
 * 形状の表すインターフェース。
 */
export interface Shape {
    /**
     * 形状タイプ。
     */
    type: ShapeType;

    /**
     * 物理エンジンが内部的に利用するプロパティ。
     *
     * 物理エンジン利用者は参照してはならない。
     */
    _bounds: number;
}
