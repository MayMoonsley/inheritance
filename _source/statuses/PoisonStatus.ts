/// <reference path="../AbstractStatus.ts" />

class PoisonStatus extends AbstractStatus {

    constructor(amount: number) {
        super(amount, StatusValidators.POSITIVE);
    }

    startTurn(affected: Combatant, other: Combatant) {
        affected.directDamage(this.amount);
        this.amount--;
    }

    add(other: AbstractStatus): boolean {
        if (other instanceof PoisonStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    }

    sameKind(other: AbstractStatus): boolean {
        return other instanceof PoisonStatus;
    }

    clone(): PoisonStatus {
        return new PoisonStatus(this.amount);
    }

    getName(): string {
        return 'poison';
    }

    getDescription(): string {
        if (this.amount === 1) {
            return `Take 1 damage at the end of this turn.`;
        } else {
            return `Take ${this.amount} damage at the start of next turn. Decreases by one each turn.`;
        }
    }

    getSortingNumber(): number {
        return 0;
    }

    getUtility(): number {
        return -1 * ((this.amount) * (this.amount + 1))/2;
    }

}