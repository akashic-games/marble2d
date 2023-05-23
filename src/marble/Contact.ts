import { Rot, Transform, Vec2, Vec2Like } from "../math";
import { Body } from "./Body";
import { CircleShape } from "./CircleShape";
import { PolygonShape } from "./PolygonShape";

/**
 * 2つの剛体の接触情報。
 *
 * 物理エンジンが接触の解決に用いる。Arbiter#contacts を参照することで
 * どの剛体間で接触があったか知ることができる。
 *
 * ただし、接触は物理エンジンによって解決されるため、現在も接触していることを
 * 示すものではない。また bodyA, bodyB 以外のプロパティは内部的に利用されるもの
 * であり、将来的に変更されるかもしれない。
 */
export interface Contact {
	/**
	 * 接触のあった剛体の1つ。
	 */
	bodyA: Body;

	/**
	 * 接触のあった剛体の1つ。
	 */
	bodyB: Body;

	separation: number; // negative value
	normal: Vec2Like; // A to B
	pointA: Vec2Like;
	pointB: Vec2Like;

	bias: number;
	mass: number;
	kn: number;
	kt: number;
}

/**
 * サークルとサークルの接触状態を求める。
 *
 * この物理エンジンが内部的に用いる関数。開発者は利用してはならない。
 *
 * @param bodyA
 * @param bodyB
 * @returns
 */
export function collisionCircleVsCircle(bodyA: Body, bodyB: Body): Contact | null {
	// Circle vs Circle では checkBoundingAreaIntersection() を用いない。
	// Contact の導出で交差判定と同じ計算が必要であるため。

	const dx = bodyB.position.x - bodyA.position.x;
	const dy = bodyB.position.y - bodyA.position.y;
	const distance2 = dx * dx + dy * dy;

	const shapeA = bodyA.shape as CircleShape;
	const shapeB = bodyB.shape as CircleShape;

	const rr = shapeA.radius + shapeB.radius;

	if (distance2 >= rr * rr) {
		return null;
	}

	const distance = Math.sqrt(distance2);

	const separation = distance - rr;
	// const normal = distance !== 0 ? { x: dx / distance, y: dy / distance } : { x: 1, y: 0 }; // 適当
	let nx: number;
	let ny: number;
	if (distance !== 0) {
		nx = dx / distance;
		ny = dy / distance;
	} else {
		// 適当
		nx = 1;
		ny = 0;
	}
	// const pointA = normal.clone().scale(shapeA.radius).add(bodyA.position);
	// const pointB = normal.clone().scale(-shapeA.radius).add(bodyB.position);

	return {
		bodyA,
		bodyB,

		separation,
		normal: {
			x: nx,
			y: ny
		},
		pointA: {
			x: nx * shapeA.radius + bodyA.position.x,
			y: ny * shapeA.radius + bodyA.position.y,
		},
		pointB: {
			x: -nx * shapeA.radius + bodyB.position.x,
			y: -ny * shapeA.radius + bodyB.position.y,
		},

		bias: 0,
		mass: 0,
		kn: 0,
		kt: 0
	};
}

/**
 * ポリゴンとサークルの接触状態を求める。
 *
 * この物理エンジンが内部的に用いる関数。開発者は利用してはならない。
 *
 * @param bodyA
 * @param bodyB
 * @returns
 */
export function collisionPolygonVsCircle(bodyA: Body, bodyB: Body): Contact | null {
	// これが遅い時、リファレンス実装に対して大きく劣る理由となっていた。
	if (!checkBoundingAreaIntersection(bodyA, bodyB)) {
		return null;
	}

	const shapeA = bodyA.shape as PolygonShape;
	const shapeB = bodyB.shape as CircleShape;

	// const circlePositionLocal = bodyA._transform.mulTVec(new Vec2(bodyB.position));
	const circlePositionLocal = {
		x: bodyB.position.x,
		y: bodyB.position.y
	};
	bodyA._transform.mulTVec(circlePositionLocal);

	let separation = Number.NEGATIVE_INFINITY;
	let vertex1: Vec2;
	let vertex2: Vec2;
	const normal = new Vec2();
	for (let i = 0; i < shapeA.localVertices.length; i++) {
		const v1 = shapeA.localVertices[i];
		const v2 = shapeA.localVertices[(i + 1) % shapeA.localVertices.length];
		const n = shapeA.localNormals[i];
		// const s = n.dot(circlePositionLocal.clone().sub(v1));
		const s = n.x * (circlePositionLocal.x - v1.x) + n.y * (circlePositionLocal.y - v1.y);
		if (s > separation) {
			separation = s;
			vertex1 = v1;
			vertex2 = v2;
			normal.copy(n);
		}
	}

	vertex1 = vertex1!;
	vertex2 = vertex2!;

	// the circle center is inside the polygon
	if (separation < 0) {
		// const pointA = normal.clone().scale(-separation);
		// const pointB = normal.clone().scale(-shapeB.radius);
		// pointA.add(circlePositionLocal).rotate(bodyA.angle).add(bodyA.position);
		// pointB.add(circlePositionLocal).rotate(bodyA.angle).add(bodyA.position);
		// bodyA._transform.mulVec(pointA.add(circlePositionLocal));
		// bodyA._transform.mulVec(pointB.add(circlePositionLocal));
		const pointA = {
			x: normal.x * -separation + circlePositionLocal.x,
			y: normal.y * -separation + circlePositionLocal.y,
		}
		bodyA._transform.mulVec(pointA);

		const pointB = {
			x: normal.x * -shapeB.radius + circlePositionLocal.x,
			y: normal.y * -shapeB.radius + circlePositionLocal.y,
		}
		bodyA._transform.mulVec(pointB);

		// normal.rotate(bodyA.angle);
		bodyA._transform.rotation.mulVec(normal);

		return {
			bodyA, // polygon
			bodyB, // circle

			separation: separation - shapeB.radius,
			normal,
			pointA,
			pointB,

			bias: 0,
			mass: 0,
			kn: 0,
			kt: 0
		};
	}

	// const v1c = circlePositionLocal.clone().sub(vertex1);
	// const v1c = new Vec2(circlePositionLocal).sub(vertex1);
	const v1c = {
		x: circlePositionLocal.x - vertex1.x,
		y: circlePositionLocal.y - vertex1.y
	};
	// const v1v2 = vertex2.clone().sub(vertex1);
	const v1v2 = {
		x: vertex2.x - vertex1.x,
		y: vertex2.y - vertex1.y
	};

	if (Vec2.dot(v1c, v1v2) < 0) {
		// const squaredDistance = v1c.squaredLength();
		const squaredDistance = v1c.x * v1c.x + v1c.y * v1c.y;

		if (squaredDistance > shapeB.radius * shapeB.radius) {
			return null;
		}

		const distance = Math.sqrt(squaredDistance);
		const separation = -(shapeB.radius - distance);
		// const normal = v1c.scale(1 / distance);
		v1c.x /= distance;
		v1c.y /= distance;
		const normal = v1c;
		// const pointA = vertex1.clone();
		const pointA = { x: vertex1.x, y: vertex1.y };
		// const pointB = vertex1.clone().add(normal.clone().scale(separation));
		const pointB = {
			x: vertex1.x + normal.x * separation,
			y: vertex1.y + normal.y * separation
		};

		// normal.rotate(bodyA.angle);
		bodyA._transform.rotation.mulVec(normal);
		// pointA.rotate(bodyA.angle).add(bodyA.position);
		// pointB.rotate(bodyA.angle).add(bodyA.position);
		bodyA._transform.mulVec(pointA);
		bodyA._transform.mulVec(pointB);

		return {
			bodyA, // polygon
			bodyB, // circle

			separation,
			normal,
			pointA,
			pointB,

			bias: 0,
			mass: 0,
			kn: 0,
			kt: 0
		};
	}

	// const v2c = circlePositionLocal.clone().sub(vertex2);
	// const v2c = new Vec2(circlePositionLocal).sub(vertex2);
	const v2c = {
		x: circlePositionLocal.x - vertex2.x,
		y: circlePositionLocal.y - vertex2.y
	};
	// const v2v1 = vertex1.clone().sub(vertex2);
	const v2v1 = {
		x: vertex1.x - vertex2.x,
		y: vertex1.y - vertex2.y
	};

	if (Vec2.dot(v2c, v2v1) < 0) {
		// const squaredDistance = v2c.squaredLength();
		const squaredDistance = v2c.x * v2c.x + v2c.y * v2c.y;

		if (squaredDistance > shapeB.radius * shapeB.radius) {
			return null;
		}

		const distance = Math.sqrt(squaredDistance);
		const separation = -(shapeB.radius - distance);
		// const normal = v2c.scale(1 / distance);
		v2c.x /= distance;
		v2c.y /= distance;
		const normal = v2c;
		// const pointA = vertex2.clone();
		const pointA = {
			x: vertex2.x,
			y: vertex2.y
		}
		// const pointB = vertex2.clone().add(normal.clone().scale(separation));
		const pointB = {
			x: vertex2.x + normal.x * separation,
			y: vertex2.y + normal.y * separation
		};

		// normal.rotate(bodyA.angle);
		bodyA._transform.rotation.mulVec(normal);
		// pointA.rotate(bodyA.angle).add(bodyA.position);
		// pointB.rotate(bodyA.angle).add(bodyA.position);
		bodyA._transform.mulVec(pointA);
		bodyA._transform.mulVec(pointB);

		return {
			bodyA, // polygon
			bodyB, // circle

			separation,
			normal,
			pointA,
			pointB,

			bias: 0,
			mass: 0,
			kn: 0,
			kt: 0
		};
	}

	if (separation > shapeB.radius) {
		return null;
	}

	// const pointA = normal.clone().scale(-separation).add(circlePositionLocal);
	const pointA = {
		x: normal.x * -separation + circlePositionLocal.x,
		y: normal.y * -separation + circlePositionLocal.y
	};
	// const pointB = normal.clone().scale(-shapeB.radius).add(circlePositionLocal);
	const pointB = {
		x: normal.x * -shapeB.radius + circlePositionLocal.x,
		y: normal.y * -shapeB.radius + circlePositionLocal.y
	};

	// normal.rotate(bodyA.angle);
	bodyA._transform.rotation.mulVec(normal);
	// pointA.rotate(bodyA.angle).add(bodyA.position);
	// pointB.rotate(bodyA.angle).add(bodyA.position);
	bodyA._transform.mulVec(pointA);
	bodyA._transform.mulVec(pointB);

	return {
		bodyA, // polygon
		bodyB, // circle

		separation: -(shapeB.radius - separation),
		normal,
		pointA,
		pointB,

		bias: 0,
		mass: 0,
		kn: 0,
		kt: 0
	};
}

/**
 * この物理エンジンが内部的に用いるインターフェース。開発者は利用してはならない。
 */
export interface SeparationInfo {
	separation: number;
	edgeIndex: number;
}

/**
 * この物理エンジンが内部的に用いる関数。開発者は利用してはならない。
 */
// NOTE: 可読性を犠牲にして式を展開している。ただし改善は数%だった。
export function findMaxSeparation(bodyA: Body, bodyB: Body): SeparationInfo {
	const shapeA = bodyA.shape as PolygonShape;
	const shapeB = bodyB.shape as PolygonShape;

	let separation = Number.NEGATIVE_INFINITY;
	let edgeIndex = 0;

	const rotA = bodyA._transform.rotation;
	const posA = bodyA._transform.position;
	const rotB = bodyB._transform.rotation;
	const posB = bodyB._transform.position;
	let v1x: number;
	let v1y: number;
	let x: number;
	let y: number;
	let nx: number;
	let ny: number;

	for (let i = 0; i < shapeA.localVertices.length; i++) {
		// const v1 = shapeA.localVertices[i].clone()
		// 	.rotate(bodyA.angle).add(bodyA.position).sub(bodyB.position).rotate(-bodyB.angle);
		// const v1 = bodyB._transform.mulTVec(bodyA._transform.mulVec(shapeA.localVertices[i].clone()));
		v1x = shapeA.localVertices[i].x;
		v1y = shapeA.localVertices[i].y;
		x = (rotA.c * v1x - rotA.s * v1y) + posA.x - posB.x;
		y = (rotA.s * v1x + rotA.c * v1y) + posA.y - posB.y;
		v1x = rotB.c * x + rotB.s * y;
		v1y = -rotB.s * x + rotB.c * y;

		// const n = shapeA.localNormals[i].clone().rotate(bodyA.angle - bodyB.angle);
		// const n = bodyA._transform.rotation.mulVec(
		// 	bodyB._transform.rotation.mulTVec(
		// 		shapeA.localNormals[i].clone()
		// 	)
		// );
		nx = shapeA.localNormals[i].x;
		ny = shapeA.localNormals[i].y;
		x = rotB.c * nx + rotB.s * ny;
		y = -rotB.s * nx + rotB.c * ny;
		nx = rotA.c * x - rotA.s * y;
		ny = rotA.s * x + rotA.c * y;

		let si = Number.POSITIVE_INFINITY;

		for (let j = 0; j < shapeB.localVertices.length; j++) {
			const v = shapeB.localVertices[j];
			// const s = v.clone().sub(v1).dot(n);
			const s = (v.x - v1x) * nx + (v.y - v1y) * ny;
			if (s < si) {
				si = s;
			}
		}

		if (si > separation) {
			separation = si;
			edgeIndex = i;
		}
	}

	return {
		separation,
		edgeIndex
	};
}

/**
 * この物理エンジンが内部的に用いる関数。開発者は利用してはならない。
 */
// NOTE: 可読性を犠牲にしているが、数%程度の性能改善にとどまっている。
export function findIncidentEdge(body1: Body, body2: Body, edgeIndex: number): Vec2Like[] {
	const shape1 = body1.shape as PolygonShape; // ref
	const shape2 = body2.shape as PolygonShape; // inc

	// const n1 = shape1.localNormals[edgeIndex].clone().rotate(body1.angle - body2.angle);
	// const n1 = body1._transform.rotation.mulVec(
	// 	body2._transform.rotation.mulTVec(
	// 		shape1.localNormals[edgeIndex].clone()
	// 	)
	// );
	const n1x = shape1.localNormals[edgeIndex].x;
	const n1y = shape1.localNormals[edgeIndex].y;
	const r1 = body1._transform.rotation;
	const r2 = body2._transform.rotation;
	const r1c = r1.c;
	const r1s = r1.s;
	const r2c = r2.c;
	const r2s = r2.s;

	const x = r2c * n1x + r2s * n1y;
	const y = -r2s * n1x + r2c * n1y;
	const nx = r1c * x - r1s * y;
	const ny = r1s * x + r1c * y;

	let minDot = Number.POSITIVE_INFINITY;
	let edgeIndex2 = 0;
	for (let i = 0; i < shape2.localVertices.length; i++) {
		// const dot = Vec2.dot(n1, shape2.localNormals[i]);
		const dot = nx * shape2.localNormals[i].x + ny * shape2.localNormals[i].y;
		if (dot < minDot) {
			minDot = dot;
			edgeIndex2 = i;
		}
	}

	const lv1 = shape2.localVertices[edgeIndex2];
	const lv2 = shape2.localVertices[(edgeIndex2 + 1) % shape2.localVertices.length];

	// const v1 = shape2.localVertices[edgeIndex2].clone();
	const v1x = lv1.x;
	const v1y = lv1.y;

	// const v2 = shape2.localVertices[(edgeIndex2 + 1) % shape2.localVertices.length].clone();
	const v2x = lv2.x;
	const v2y = lv2.y;

	const dx = body2._transform.position.x;
	const dy = body2._transform.position.y;

	// v1.rotate(body2.angle).add(body2.position);
	// v2.rotate(body2.angle).add(body2.position);
	// body2._transform.mulVec(v1);
	return [
		{
			x: (r2c * v1x - r2s * v1y) + dx,
			y: (r2s * v1x + r2c * v1y) + dy
		},
		{
			x: (r2c * v2x - r2s * v2y) + dx,
			y: (r2s * v2x + r2c * v2y) + dy
		}
	];
}

/**
 * この物理エンジンが内部的に用いる関数。開発者は利用してはならない。
 */
export function clipSegmentToLine(points: Vec2Like[], normal: Vec2Like, offset: number): Vec2Like[] {
	const clipPoints: Vec2Like[] = [];

	const distance0 = Vec2.dot(normal, points[0]) - offset;
	const distance1 = Vec2.dot(normal, points[1]) - offset;

	if (distance0 <= 0) {
		clipPoints.push(points[0]);
	}
	if (distance1 <= 0) {
		clipPoints.push(points[1]);
	}

	if (distance0 * distance1 < 0) {
		const t = distance0 / (distance0 - distance1);
		// clipPoints.push(points[0].clone().add(points[1].clone().sub(points[0]).scale(t)));
		clipPoints.push({
			x: points[0].x + (points[1].x - points[0].x) * t,
			y: points[0].y + (points[1].y - points[0].y) * t,
		});
	}

	return clipPoints;
}

/**
 * 二体の境界が交差しているか調べる。
 *
 * @param bodyA
 * @param bodyB
 * @returns 真の時、交差している。
 */
function checkBoundingAreaIntersection(bodyA: Body, bodyB: Body): boolean {
	const dx = bodyB.position.x - bodyA.position.x;
	const dy = bodyB.position.y - bodyA.position.y;
	const sqDistance = dx * dx + dy * dy;
	const bounds2 = bodyA.shape._bounds + bodyB.shape._bounds;
	return sqDistance < bounds2 * bounds2;
}

/**
 * 二体の交差情報。
 *
 * この物理エンジンが内部的に用いる型。開発者は利用してはならない。
 */
export interface Separation {
	body1: Body; // reference
	body2: Body; // incident
	separation: number;
	edgeIndex: number;
	incidentEdges: Vec2Like[];
	tangent: Vec2Like;
	normal: Vec2Like;
	frontOffset: number;
	sideOffset1: number;
	sideOffset2: number;
}

/**
 *
 * @param bodyA
 * @param bodyB
 * @returns
 */
// NOTE: 可読性を犠牲にしているが、ほとんど性能改善に寄与していない。
export function checkSeparation(bodyA: Body, bodyB: Body): Separation | null {
	const separationInfoAB = findMaxSeparation(bodyA, bodyB);

	if (separationInfoAB.separation > 0) {
		return null;
	}

	const separationInfoBA = findMaxSeparation(bodyB, bodyA);

	if (separationInfoBA.separation > 0) {
		return null;
	}

	let body1: Body; // reference
	let body2: Body; // incident
	let separationInfo: SeparationInfo;
	if (separationInfoBA.separation > separationInfoAB.separation) {
		body1 = bodyB;
		body2 = bodyA;
		separationInfo = separationInfoBA;
	} else {
		body1 = bodyA;
		body2 = bodyB;
		separationInfo = separationInfoAB;
	}

	const incidentEdges = findIncidentEdge(body1, body2, separationInfo.edgeIndex);

	const shape1 = body1.shape as PolygonShape;
	const v11Index = separationInfo.edgeIndex;
	const v12Index = (separationInfo.edgeIndex + 1) % shape1.localVertices.length;
	const lv11 = shape1.localVertices[v11Index];
	// const v11 = shape1.localVertices[v11Index].clone();
	const v11 = {
		x: lv11.x,
		y: lv11.y
	};
	const lv12 = shape1.localVertices[v12Index];
	// const v12 = shape1.localVertices[v12Index].clone();
	const v12 = {
		x: lv12.x,
		y: lv12.y
	};
	// const localTangent = v12.clone().sub(v11).normalize();
	const localTangent = {
		x: v12.x - v11.x,
		y: v12.y - v11.y
	};
	Vec2.normalize(localTangent);
	const tangent = body1._transform.rotation.mulVec(localTangent);
	const normal = {
		x: tangent.y,
		y: -tangent.x
	};

	// v11.rotate(body1.angle).add(body1.position);
	// v12.rotate(body1.angle).add(body1.position);
	body1._transform.mulVec(v11);
	body1._transform.mulVec(v12);

	const frontOffset = Vec2.dot(normal, v11);
	const sideOffset1 = -Vec2.dot(tangent, v11);
	const sideOffset2 = Vec2.dot(tangent, v12);

	return {
		body1,
		body2,
		separation: separationInfo.separation,
		edgeIndex: separationInfo.edgeIndex,
		incidentEdges,
		tangent,
		normal,
		frontOffset,
		sideOffset1,
		sideOffset2
	};
}

/**
 * この物理エンジンが内部的に用いる関数。開発者は利用してはならない。
 */
export function collisionPolygonVsPolygon(bodyA: Body, bodyB: Body): Contact[] | null {
	if (!checkBoundingAreaIntersection(bodyA, bodyB)) {
		return null;
	}

	const sep = checkSeparation(bodyA, bodyB);
	if (!sep) {
		return null;
	}

	// const clipPoints1 = clipSegmentToLine(sep.incidentEdges, sep.tangent.clone().scale(-1), sep.sideOffset1);
	const clipPoints1 = clipSegmentToLine(sep.incidentEdges, { x: -sep.tangent.x, y: -sep.tangent.y }, sep.sideOffset1);

	if (clipPoints1.length < 2) {
		return null;
	}

	const clipPoints2 = clipSegmentToLine(clipPoints1, sep.tangent, sep.sideOffset2);

	if (clipPoints2.length < 2) {
		return null;
	}

	const contacts: Contact[] = [];

	const normal = sep.normal;

	for (let i = 0; i < clipPoints2.length; i++) {
		const separation = Vec2.dot(normal, clipPoints2[i]) - sep.frontOffset;
		if (separation < 0) {
			contacts.push({
				bodyA: sep.body1,
				bodyB: sep.body2,

				separation,
				normal,
				// pointA: clipPoints2[i].clone().add(normal.clone().scale(-separation)),
				pointA: {
					x: clipPoints2[i].x - normal.x * separation,
					y: clipPoints2[i].y - normal.y * separation,
				},
				pointB: clipPoints2[i],

				bias: 0,
				mass: 0,
				kn: 0,
				kt: 0
			});
		}
	}

	return contacts;
}
