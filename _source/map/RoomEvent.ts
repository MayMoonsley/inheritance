/// <reference path="Floor.ts" />

enum RoomIcon {
    ENEMY = "tiles/items and misc tiles/enemy.png",
    EXIT = "tiles/items and misc tiles/exit.png",
    MODIFIER = "tiles/items and misc tiles/modifier.png",
    SHOP = "tiles/items and misc tiles/shop.png",
    TRAIT = "tiles/items and misc tiles/trait.png",
    NONE = "",
    TOOL = "tiles/items and misc tiles/enemy.png",
    BOSS = "tiles/items and misc tiles/boss.png",
    GOLDFISH = "tiles/items and misc tiles/goldfish.png",
    Collectible = "tiles/items and misc tiles/note.png"
}

abstract class RoomEvent {
    abstract roomType: RoomType;
    abstract roomIcon: RoomIcon;

    // Upon entering each room, this will trigger some event for the room, such
    // as picking up a tool or starting a fight. After the event, a new event is
    // returned which is used the next time the room is entered. Some events
    // reoccur after a certain number of room entrances, so we inject the total
    // number here.
    abstract onRoomEnter(room: Room, roomsEntered: number): RoomEvent;

    private static parseWeights(weights: { name: string; weight: number }[]): [string, number][] {
        return weights.map(w => [w.name, w.weight]);
    }
}

class EmptyRoomEvent extends RoomEvent {
    roomType = RoomType.Empty;
    roomIcon = RoomIcon.NONE;

    constructor(roomType: RoomType.Empty | RoomType.Entrance) {
        super();
        this.roomType = roomType;
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        room.containerFloor.redraw();
        return this;
    }
}

class ExitRoomEvent extends RoomEvent {
    roomType = RoomType.Exit;
    roomIcon = RoomIcon.EXIT;

    constructor() {
        super();
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        Game.currentRun.nextFloor(); //TODO: make this optional
        return this;
    }
}

class ToolRoomEvent extends RoomEvent {
    roomType = RoomType.Tool;
    roomIcon = RoomIcon.TOOL;

    constructor(private tool: Tool) {
        super();
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        room.containerFloor.redraw();
        // TODO
        return new EmptyRoomEvent(RoomType.Empty);
    }
}

class EnemyRoomEvent extends RoomEvent {
    roomType = RoomType.Enemy;
    roomIcon = RoomIcon.ENEMY;

    // The last roomsEntered count when the enemy was defeated
    private lastEntered: number = 0;
    private firstEntry: boolean = true;

    // The enemy is allowed to recover after the player has entered and left a
    // certain number of rooms; this is its recoveryTime
    constructor(private enemy: Enemy, private recoveryTime?: number) {
        super();
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        // Note: we don't redraw if we fight the enemy
        if (this.firstEntry || (this.recoveryTime !== undefined && (roomsEntered - this.lastEntered) > this.recoveryTime)) {
            this.lastEntered = roomsEntered;
            if (this.firstEntry) {
                this.firstEntry = false;
            } else {
                this.enemy.heal(this.enemy.maxHealth);
            }
            new Fight(room.containerFloor.currentRun.player, this.enemy, room);
        } else {
            room.containerFloor.redraw();
        }
        if (!this.recoveryTime || this.recoveryTime === Infinity) {
            return new EmptyRoomEvent(RoomType.Empty);
        }
        return this;
    }
}

class ModifierRoomEvent extends RoomEvent {

    roomType = RoomType.Modifier;
    roomIcon = RoomIcon.MODIFIER;
    private modifier: Modifier;

    constructor(m: Modifier) {
        super();
        this.modifier = m;
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        UI.fillScreen(UI.renderModifier(this.modifier, Game.currentRun.player, (taken) => {
            if (taken) {
                room.clearEvent();
            }
            room.containerFloor.redraw();
        }));
        return this;
    }

}

class TraitRoomEvent extends RoomEvent {

    roomType = RoomType.Trait;
    roomIcon = RoomIcon.TRAIT;
    private trait: Trait;

    constructor(t: Trait) {
        super();
        this.trait = t;
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        UI.fillScreen(UI.renderTrait(this.trait, Game.currentRun.player, (taken) => {
            if (taken) {
                room.clearEvent();
            }
            room.containerFloor.redraw();
        }));
        return this;
    }

}

class ShopRoomEvent extends RoomEvent {

    roomType = RoomType.Shop;
    roomIcon = RoomIcon.SHOP;
    private shop;

    constructor(shop: Shop) {
        super();
        this.shop = shop;
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        UI.fillScreen(UI.renderShopMenu(this.shop, Game.currentRun.player, () => {
            room.containerFloor.redraw();
        }))
        return this;
    }

}

class CollectibleRoomEvent extends RoomEvent {

    roomType = RoomType.Collectible;
    roomIcon = RoomIcon.Collectible;
    scripRewardRange: [number, number];

    constructor(scripRewardRange: [number, number]) {
        super();
        this.scripRewardRange = scripRewardRange;
    }

    onRoomEnter(room: Room, roomsEntered: number): RoomEvent {
        // try to unlock new note
        let note: Note = NotePool.unlockNewNote();
        if (note) {
            UI.fillScreen(UI.renderNote(() => room.containerFloor.redraw(), note));
        } else {
            // if the player has unlocked all notes in the game, give them a scrip reward instead
            let reward: number = Random.tupleInt(this.scripRewardRange);
            Game.currentRun.player.giveCurrency(reward);
            UI.fillScreen(UI.renderScripReward(() => room.containerFloor.redraw(), reward));
        }
        return new EmptyRoomEvent(RoomType.Empty);
    }

}
