// see: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/sign#Polyfill
export function sign(x: number): number {
	return (((x > 0) as any) - ((x < 0) as any)) || +x;
}
