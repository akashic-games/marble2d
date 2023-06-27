import * as aimgui from "@akashic-extension/aimgui";
import {
	Body, CircleShape, PolygonShape, Vec2, World
} from "@akashic-extension/marble2d";
import { BodyE } from "./BodyE";
import { LineE } from "./LineE";
import { GameMainParameterObject } from "./parameterObject";
import { WorldE } from "./WorldE";

/** 床の幅。 */
const floorWidth = g.game.width - 32;

/** 床の高さ */
const floorHeight = 32;

/** 床の位置 */
const floorPosition = {
	x: g.game.width / 2,
	y: g.game.height - floorHeight
};

/**
 * 斜面を生成する。
 *
 * @param scene シーン。
 * @param world 物理世界。
 * @returns 斜面のBodyE。
 */
function createSlope(scene: g.Scene, world: World): BodyE {
	const width = 360;
	const height = 8;
	const body = new Body({
		mass: 0,
		momentOfInertia: 0,
		position: { x: g.game.width / 2, y: g.game.height / 2 },
		angle: Math.PI / 6,
		shape: new PolygonShape([
			{ x: -width / 2, y: -height / 2 },
			{ x: +width / 2, y: -height / 2 },
			{ x: +width / 2, y: +height / 2 },
			{ x: -width / 2, y: +height / 2 }
		])
	});

	world.addBody(body);

	const bodyE = new BodyE({
		scene,
		x: body.position.x,
		y: body.position.y,
		anchorX: 0.5,
		anchorY: 0.5,
		angle: body.angle / Math.PI * 180,
		body,
		circleImageAsset: scene.asset.getImageById("circle")
	});

	return bodyE;
}

/**
 * 垂直な壁を生成する。
 *
 * @param scene シーン。
 * @param world 物理世界。
 * @param side 配置。左右のいずれか。
 * @returns 垂直な壁のBodyE。
 */
function createWall(scene: g.Scene, world: World, side: "left" | "right"): BodyE {
	const width = 16;
	const height = 320;
	const body = new Body({
		mass: 0,
		momentOfInertia: 0,
		position: {
			x: floorPosition.x + (floorWidth / 2 - width / 2) * (side === "left" ? -1 : 1),
			y: floorPosition.y - floorHeight / 2 - height / 2
		},
		shape: new PolygonShape([
			{ x: -width / 2, y: -height / 2 },
			{ x: +width / 2, y: -height / 2 },
			{ x: +width / 2, y: +height / 2 },
			{ x: -width / 2, y: +height / 2 }
		])
	});

	world.addBody(body);

	const bodyE = new BodyE({
		scene,
		x: body.position.x,
		y: body.position.y,
		anchorX: 0.5,
		anchorY: 0.5,
		body,
		circleImageAsset: scene.asset.getImageById("circle")
	});

	return bodyE;
}

/**
 * アプリの状態型。
 */
interface AppState {
	tool: "add-object" | "apply-impulse";
	shape: "sphere" | "koma";
	slope: boolean;
	wall: boolean;
}

/**
 * メイン関数。
 *
 * @param param パラメタ。
 */
export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		assetIds: ["circle"]
	});

	const state: AppState = {
		tool: "add-object",
		shape: "sphere",
		slope: false,
		wall: false,
	};

	let slopeBodyE: BodyE | null = null;
	let leftWallE: BodyE | null = null;
	let rightWallE: BodyE | null = null;

	// =====================================================================
	// 物理世界の生成。
	// =====================================================================
	const world = new World({
		center: { x: g.game.width / 2, y: g.game.height / 2 },
		iteration: 4
	});

	// BodyEを破棄するユーティリティ関数。
	const destroyBodyE = (e: BodyE | null | undefined): void => {
		if (e && !e.destroyed()) {
			world.removeBody(e.body);
			e.destroy();
		}
	};

	scene.onLoad.add(() => {
		// =====================================================================
		// シーンの構築。
		// =====================================================================
		const tapArea = new g.FilledRect({
			scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "#99FFFF",
			touchable: true
		});
		const bodyLayer = new g.E({ scene });
		const worldLayer = new g.E({ scene });

		const font = new g.DynamicFont({
			game: g.game,
			size: 10,
			fontFamily: "monospace",
			fontColor: "white"
		});

		const guiE = new aimgui.GuiE({
			scene,
			width: g.game.width,
			height: g.game.height,
			font
		});

		scene.append(tapArea);
		scene.append(bodyLayer);
		scene.append(worldLayer);
		scene.append(guiE);

		// =====================================================================
		// 床。
		// =====================================================================
		const floorBody = new Body({
			mass: 0,
			momentOfInertia: 0,
			position: floorPosition,
			shape: new PolygonShape([
				{ x: -floorWidth / 2, y: -floorHeight / 2 },
				{ x: +floorWidth / 2, y: -floorHeight / 2 },
				{ x: +floorWidth / 2, y: +floorHeight / 2 },
				{ x: -floorWidth / 2, y: +floorHeight / 2 }
			])
		});
		world.addBody(floorBody);

		const floorBodyE = new BodyE({
			scene,
			x: floorBody.position.x,
			y: floorBody.position.y,
			anchorX: 0.5,
			anchorY: 0.5,
			body: floorBody,
			circleImageAsset: scene.asset.getImageById("circle")
		});

		floorBodyE.onUpdate.add(() => {
			floorBodyE.angle = floorBody.angle / Math.PI * 180;
			floorBodyE.modified();
		});

		bodyLayer.append(floorBodyE);

		// =====================================================================
		// 壁。
		// =====================================================================
		if (state.wall) {
			leftWallE = createWall(scene, world, "left");
			rightWallE = createWall(scene, world, "right");
			bodyLayer.append(leftWallE);
			bodyLayer.append(rightWallE);
		}

		// =====================================================================
		// スロープ。
		// =====================================================================
		if (state.slope) {
			slopeBodyE = createSlope(scene, world);
			bodyLayer.append(slopeBodyE);
		}

		// =====================================================================
		// 物理世界の詳細表示(デバッグ用)。
		// =====================================================================
		const worldE = new WorldE({
			scene,
			world
		});

		worldLayer.append(worldE);

		// =====================================================================
		// 物理世界の計算時間算出。
		// =====================================================================
		let accTime = 0;
		let cntr = 0;
		let worldUpdateTime = 0;
		scene.onUpdate.add(() => {
			const now = Date.now();
			world.step(1 / g.game.fps);
			accTime += Date.now() - now;

			cntr++;

			// Log physics engine CPU load.
			const logIntervalInFrame = g.game.fps * 2;
			if (cntr % logIntervalInFrame === 0) {
				worldUpdateTime = accTime / logIntervalInFrame;
				accTime = 0;
			}
		});

		// =====================================================================
		// 円やコマのタッチ操作。
		// =====================================================================
		const addTouchHandler = (bodyE: BodyE): void => {
			let lineE: LineE | null = null;

			const pointerInitialPositionInGlobal = new Vec2();
			const pointerStartDelta = new Vec2();
			const tappedPositionInLocal = new Vec2();
			const updateHandler = (): void => {
				if (lineE == null || lineE.destroyed()) {
					return;
				}
				lineE.from.copy(pointerInitialPositionInGlobal).add(pointerStartDelta);
				lineE.to.copy(bodyE.localToGlobal(tappedPositionInLocal));
			};

			// 座標系:
			// - ev.point: E の座標系での位置。E の左上隅が原点（アンカーの影響を受けない）。
			// - ev.startDelta: 画面の座標系での移動量。つまり E の座標系とは無関係。

			bodyE.onPointDown.add(ev => {
				if (state.tool === "add-object") {
					return;
				}
				if (lineE && !lineE.destroyed()) {
					lineE.destroy();
				}

				pointerInitialPositionInGlobal.copy(bodyE.localToGlobal(ev.point));
				pointerStartDelta.copy({ x: 0, y: 0 });
				tappedPositionInLocal.copy(ev.point);

				lineE = new LineE({
					scene,
					from: pointerInitialPositionInGlobal,
					to: pointerInitialPositionInGlobal
				});

				lineE.onUpdate.add(updateHandler);

				bodyLayer.append(lineE);
			});

			bodyE.onPointMove.add(ev => {
				pointerStartDelta.copy(ev.startDelta);
			});

			bodyE.onPointUp.add(ev => {
				if (lineE && !lineE.destroyed()) {
					lineE.destroy();
				}

				if (state.tool !== "apply-impulse") {
					return;
				}

				const tappedPositionInGlobal = new Vec2(bodyE.localToGlobal(ev.point));

				const r = tappedPositionInGlobal.clone()
					.sub(bodyE.body.position);
				const p = tappedPositionInGlobal.clone()
					.sub(pointerInitialPositionInGlobal.clone().add(ev.startDelta))
					.scale(2);

				bodyE.body.applyImpulse(r, p);
			});
		};

		// =====================================================================
		// タッチ操作による物体の追加。
		// =====================================================================
		const addObject = (ev: g.PointDownEvent): void => {
			// 質量。
			const mass = 1;

			// 慣性モーメント。大きいほど回転しにくくなる。
			const momentOfInertia = 250;

			// 反発係数。
			const restitution = 0.3;

			// 摩擦係数。
			const mu = 0.99;

			// 並進速度減衰数。
			const linearDamping = 0.1;

			// 角速度減衰係数。
			const angularDamping = 0.1;

			const hWidth = 24;
			const hHeight = 24;

			// 剛体を生成する。
			const shape = state.shape === "koma" ?
				new PolygonShape([
					{ x: -hWidth, y: -hHeight },
					{ x: 0, y: -hHeight * 1.5 },
					{ x: +hWidth, y: -hHeight },
					{ x: +hWidth, y: +hHeight },
					{ x: -hWidth, y: +hHeight }
				]) :
				new CircleShape(hWidth);

			const width = hWidth * 2;
			const height = state.shape === "koma" ? hHeight + hHeight * 1.5 : hHeight * 2;
			const anchorX = 0.5;
			const anchorY = state.shape === "koma" ? hHeight * 1.5 / height : 0.5;

			const newBody = new Body({
				position: ev.point,
				mass,
				momentOfInertia,
				restitution,
				mu,
				linearDamping,
				angularDamping,
				shape
			});

			world.addBody(newBody);

			const newBodyE = new BodyE({
				scene,
				body: newBody,
				x: newBody.position.x,
				y: newBody.position.y,
				width,
				height,
				anchorX,
				anchorY,
				circleImageAsset: scene.asset.getImageById("circle"),
				touchable: true
			});

			addTouchHandler(newBodyE);

			newBodyE.onUpdate.add(() => {
				Vec2.copy(newBodyE, newBody.position);
				newBodyE.angle = newBody.angle / Math.PI * 180;
				newBodyE.modified();
			});

			bodyLayer.append(newBodyE);
		};

		tapArea.onPointDown.add(ev => {
			if (state.tool === "add-object") {
				addObject(ev);
			}
		});

		// =====================================================================
		// GUI表示。
		// =====================================================================
		guiE.run = gui => {
			gui.window("ツール")
				.position(16, 16)
				.size(160, 192)
				.show(ui => {
					ui.label(`CPU: ${Math.floor(worldUpdateTime * 100) / 100} [ms/frame]`);
					ui.label(`Num Obj: ${world.bodies.length}`);

					ui.checkbox("接触点", worldE, "showContact");

					if (ui.checkbox("スロープ", state, "slope")) {
						destroyBodyE(slopeBodyE);
						if (state.slope) {
							slopeBodyE = createSlope(scene, world);
							bodyLayer.append(slopeBodyE);
						} else {
							slopeBodyE = null;
						}
					}

					if (ui.checkbox("壁", state, "wall")) {
						destroyBodyE(leftWallE);
						destroyBodyE(rightWallE);
						if (state.wall) {
							leftWallE = createWall(scene, world, "left");
							rightWallE = createWall(scene, world, "right");
							bodyLayer.append(leftWallE);
							bodyLayer.append(rightWallE);
						} else {
							leftWallE = null;
							rightWallE = null;
						}
					}

					ui.collapsing("ツール", ui => {
						ui.radioButton("剛体追加", state, "tool", "add-object");
						if (state.tool === "add-object") {
							ui.collapsing("形状", ui => {
								ui.radioButton("円", state, "shape", "sphere");
								ui.radioButton("駒", state, "shape", "koma");
							});
						}
						ui.radioButton("撃力を加える", state, "tool", "apply-impulse");
					});
				});
		};
	});

	g.game.pushScene(scene);
}
