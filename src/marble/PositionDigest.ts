/**
 * 位置ダイジェストのビットマスク。
 *
 * World の center から見た上下左右の空間をビットマスクで表す。
 * この物理エンジンが内部的に用いる機能。開発者は利用してはならない。
 */
export const enum PositionDigestBit {
	None   = 0b0000,
	Left   = 0b0001,
	Right  = 0b0010,
	Top    = 0b0100,
	Bottom = 0b1000,
	X      = 0b0011,
	Y      = 0b1100,
	All    = 0b1111,
}

/**
 * 位置ダイジェストのビットシフト量。
 * この物理エンジンが内部的に用いる機能。開発者は利用してはならない。
 */
export const enum PositionDigestBitShift {
	Left = 0,
	Right = 1,
	Top = 2,
	Bottom = 3,
}
