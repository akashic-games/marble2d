import { World, Arbiter, Contact, Vec2 } from "@akashic-extension/marble2d";

export interface WorldEParameterObject extends g.EParameterObject {
	world: World;
	showContact?: boolean;
}

export class WorldE extends g.E {
	readonly world: World;

	/**
	 * 接触点の表示。
	 *
	 * 真の時、接触点を表示する。
	 */
	showContact: boolean;

	constructor(param: WorldEParameterObject) {
		super(param);
		this.world = param.world;
		this.showContact = param.showContact ?? false;
		this.onUpdate.add(() => this.modified());
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		for (const arbiters of this.world.arbiters) {
			this.renderArbiter(renderer, arbiters);
		}
		return true;
	}

	private renderArbiter(renderer: g.Renderer, arbiter: Arbiter): void {
		if (this.showContact) {
			for (const contact of arbiter.contacts) {
				this.drawContact(renderer, contact);
			}
		}
	}

	private drawContact(renderer: g.Renderer, contact: Contact): void {
		const normal = new Vec2(contact.normal);
		const sep = normal.clone().scale(-contact.separation);
		const start = new Vec2(contact.pointB);
		const end = new Vec2(contact.pointA);

		renderer.fillRect(
			start.x - 3, start.y - 3,
			6, 6,
			"red"
		);

		renderer.fillRect(
			end.x - 3, end.y - 3,
			6, 6,
			"pink"
		);

		const dir = sep.clone().normalize();

		renderer.save();
		renderer.transform([
			dir.x, dir.y,
			-dir.y, dir.x,
			start.x, start.y
		]);
		renderer.fillRect(0, 0, sep.length(), 2, "green");
		renderer.restore();
	}
}
