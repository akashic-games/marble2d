/**
 * 値を上限と下限の間に制限する
 *
 * @param v 制限する値。
 * @param min 下限を表す値。
 * @param max 上限を表す値。
 * @returns 制限された値。
 */
export function clamp(v: number, min: number, max: number): number {
	if (v < min) return min;
	else if (v > max) return max;
	return v;
}
