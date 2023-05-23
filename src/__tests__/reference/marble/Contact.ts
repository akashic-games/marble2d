import { Vec2, Vec2Like } from "../math";
import { Body } from "./Body";
import { CircleShape } from "./CircleShape";
import { PolygonShape } from "./PolygonShape";

export interface Contact {
	bodyA: Body;
	bodyB: Body;

	separation: number; // negative valuea
	normal: Vec2Like; // A to B
	pointA: Vec2Like;
	pointB: Vec2Like;

	bias: number;
	mass: number;
	kn: number;
	kt: number;
}

export function collisionCircleVsCircle(bodyA: Body, bodyB: Body): Contact | null {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const AB = new Vec2(
		bodyB.position.x - bodyA.position.x,
		bodyB.position.y - bodyA.position.y
	);
	const distance = AB.length();

	const shapeA = bodyA.shape as CircleShape;
	const shapeB = bodyB.shape as CircleShape;

	if (distance >= shapeA.radius + shapeB.radius) {
		return null;
	}

	const separation = distance - (shapeA.radius + shapeB.radius);
	const normal = distance !== 0 ? AB.scale(1 / distance) : new Vec2(1, 0); // 適当。
	const pointA = normal.clone().scale(shapeA.radius).add(bodyA.position);
	const pointB = normal.clone().scale(-shapeA.radius).add(bodyB.position);

	return {
		bodyA,
		bodyB,

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

export function collisionPolygonVsCircle(bodyA: Body, bodyB: Body): Contact | null {
	const shapeA = bodyA.shape as PolygonShape;
	const shapeB = bodyB.shape as CircleShape;

	const circlePositionLocal = bodyA._transform.mulTVec(new Vec2(bodyB.position));

	let separation = Number.NEGATIVE_INFINITY;
	let vertex1: Vec2;
	let vertex2: Vec2;
	let normal: Vec2;
	for (let i = 0; i < shapeA.localVertices.length; i++) {
		const v1 = shapeA.localVertices[i];
		const v2 = shapeA.localVertices[(i + 1) % shapeA.localVertices.length];
		const n = shapeA.localNormals[i];
		const s = n.dot(circlePositionLocal.clone().sub(v1));
		if (s > separation) {
			separation = s;
			vertex1 = v1;
			vertex2 = v2;
			normal = n.clone();
		}
	}

	normal = normal!;
	vertex1 = vertex1!;
	vertex2 = vertex2!;

	// the circle center is inside the polygon
	if (separation < 0) {
		const pointA = normal.clone().scale(-separation);
		const pointB = normal.clone().scale(-shapeB.radius);

		// pointA.add(circlePositionLocal).rotate(bodyA.angle).add(bodyA.position);
		// pointB.add(circlePositionLocal).rotate(bodyA.angle).add(bodyA.position);
		bodyA._transform.mulVec(pointA.add(circlePositionLocal));
		bodyA._transform.mulVec(pointB.add(circlePositionLocal));
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

	const v1c = circlePositionLocal.clone().sub(vertex1);
	const v1v2 = vertex2.clone().sub(vertex1);

	if (v1c.dot(v1v2) < 0) {
		const squaredDistance = v1c.squaredLength();

		if (squaredDistance > shapeB.radius * shapeB.radius) {
			return null;
		}

		const distance = Math.sqrt(squaredDistance);
		const separation = -(shapeB.radius - distance);
		const normal = v1c.scale(1 / distance);
		const pointA = vertex1.clone();
		const pointB = vertex1.clone().add(normal.clone().scale(separation));

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

	const v2c = circlePositionLocal.clone().sub(vertex2);
	const v2v1 = vertex1.clone().sub(vertex2);

	if (v2c.dot(v2v1) < 0) {
		const squaredDistance = v2c.squaredLength();

		if (squaredDistance > shapeB.radius * shapeB.radius) {
			return null;
		}

		const distance = Math.sqrt(squaredDistance);
		const separation = -(shapeB.radius - distance);
		const normal = v2c.scale(1 / distance);
		const pointA = vertex2.clone();
		const pointB = vertex2.clone().add(normal.clone().scale(separation));

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

	const pointA = normal.clone().scale(-separation).add(circlePositionLocal);
	const pointB = normal.clone().scale(-shapeB.radius).add(circlePositionLocal);

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

export interface SeparationInfo {
	separation: number;
	edgeIndex: number;
}

export function findMaxSeparation(bodyA: Body, bodyB: Body): SeparationInfo {
	const shapeA = bodyA.shape as PolygonShape;
	const shapeB = bodyB.shape as PolygonShape;

	let separation = Number.NEGATIVE_INFINITY;
	let edgeIndex = 0;

	for (let i = 0; i < shapeA.localVertices.length; i++) {
		// const v1 = shapeA.localVertices[i].clone()
		// 	.rotate(bodyA.angle).add(bodyA.position).sub(bodyB.position).rotate(-bodyB.angle);
		const v1 = bodyB._transform.mulTVec(bodyA._transform.mulVec(shapeA.localVertices[i].clone()));

		// const n = shapeA.localNormals[i].clone().rotate(bodyA.angle - bodyB.angle);
		const n = bodyA._transform.rotation.mulVec(
			bodyB._transform.rotation.mulTVec(
				shapeA.localNormals[i].clone()
			)
		);

		let si = Number.POSITIVE_INFINITY;
		for (let j = 0; j < shapeB.localVertices.length; j++) {
			const v = shapeB.localVertices[j];
			const s = v.clone().sub(v1).dot(n);
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

export function findIncidentEdge(body1: Body, body2: Body, edgeIndex: number): Vec2[] {
	const shape1 = body1.shape as PolygonShape; // ref
	const shape2 = body2.shape as PolygonShape; // inc

	// const n1 = shape1.localNormals[edgeIndex].clone().rotate(body1.angle - body2.angle);
	const n1 = body1._transform.rotation.mulVec(
		body2._transform.rotation.mulTVec(
			shape1.localNormals[edgeIndex].clone()
		)
	);

	let minDot = Number.POSITIVE_INFINITY;
	let edgeIndex2 = 0;
	for (let i = 0; i < shape2.localVertices.length; i++) {
		const n2 = shape2.localNormals[i];
		const dot = n1.dot(n2);
		if (dot < minDot) {
			minDot = dot;
			edgeIndex2 = i;
		}
	}

	const v1 = shape2.localVertices[edgeIndex2].clone();
	const v2 = shape2.localVertices[(edgeIndex2 + 1) % shape2.localVertices.length].clone();
	// v1.rotate(body2.angle).add(body2.position);
	// v2.rotate(body2.angle).add(body2.position);
	body2._transform.mulVec(v1);
	body2._transform.mulVec(v2);

	return [v1, v2];
}

export function clipSegmentToLine(points: Vec2[], normal: Vec2, offset: number): Vec2[] {
	const clipPoints: Vec2[] = [];

	const distance0 = normal.dot(points[0]) - offset;
	const distance1 = normal.dot(points[1]) - offset;

	if (distance0 <= 0) {
		clipPoints.push(points[0]);
	}
	if (distance1 <= 0) {
		clipPoints.push(points[1]);
	}

	if (distance0 * distance1 < 0) {
		const t = distance0 / (distance0 - distance1);
		clipPoints.push(points[0].clone().add(points[1].clone().sub(points[0]).scale(t)));
	}

	return clipPoints;
}

// リファレンス実装では使用していない。性能比較用。
export interface Separation {
	body1: Body; // reference
	body2: Body; // incident
	separation: number;
	edgeIndex: number;
	incidentEdges: Vec2Like[];
	tangent: Vec2;
	normal: Vec2;
	frontOffset: number;
	sideOffset1: number;
	sideOffset2: number;
}

// リファレンス実装では使用していない。性能比較用。
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
	const v11 = shape1.localVertices[v11Index].clone();
	const v12 = shape1.localVertices[v12Index].clone();
	const localTangent = v12.clone().sub(v11).normalize();
	const tangent = body1._transform.rotation.mulVec(localTangent.clone());
	const normal = new Vec2(tangent.y, -tangent.x);

	// v11.rotate(body1.angle).add(body1.position);
	// v12.rotate(body1.angle).add(body1.position);
	body1._transform.mulVec(v11);
	body1._transform.mulVec(v12);

	const frontOffset = normal.dot(v11);
	const sideOffset1 = -tangent.dot(v11);
	const sideOffset2 = tangent.dot(v12);

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

export function collisionPolygonVsPolygon(bodyA: Body, bodyB: Body): Contact[] | null {
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
	const v11 = shape1.localVertices[v11Index].clone();
	const v12 = shape1.localVertices[v12Index].clone();
	const localTangent = v12.clone().sub(v11).normalize();
	const tangent = body1._transform.rotation.mulVec(localTangent.clone());
	const normal = new Vec2(tangent.y, -tangent.x);

	// v11.rotate(body1.angle).add(body1.position);
	// v12.rotate(body1.angle).add(body1.position);
	body1._transform.mulVec(v11);
	body1._transform.mulVec(v12);

	const frontOffset = normal.dot(v11);
	const sideOffset1 = -tangent.dot(v11);
	const sideOffset2 = tangent.dot(v12);

	const clipPoints1 = clipSegmentToLine(incidentEdges, tangent.clone().scale(-1), sideOffset1);

	if (clipPoints1.length < 2) {
		return null;
	}

	const clipPoints2 = clipSegmentToLine(clipPoints1, tangent, sideOffset2);

	if (clipPoints2.length < 2) {
		return null;
	}

	const contacts: Contact[] = [];

	for (let i = 0; i < clipPoints2.length; i++) {
		const separation = normal.dot(clipPoints2[i]) - frontOffset;
		if (separation < 0) {
			contacts.push({
				bodyA: body1,
				bodyB: body2,

				separation,
				normal,
				pointA: clipPoints2[i].clone().add(normal.clone().scale(-separation)),
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
