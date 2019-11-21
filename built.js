var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var AI = (function () {
    function AI(aiCombatant, humanCombatant) {
        this.botCopy = aiCombatant.clone();
        this.humanCopy = humanCombatant.clone();
        this.botCopy.opponent = this.humanCopy;
        this.humanCopy.opponent = this.botCopy;
        this.bestSequence = [];
        var statuses = this.botCopy.statuses;
        var preferenceOverride = undefined;
        statuses.forEach(function (status) {
            if (status.overridenUtilityFunction != undefined) {
                preferenceOverride = status.overridenUtilityFunction;
            }
        });
        this.scoreFunction = preferenceOverride || this.botCopy.utilityFunction;
        this.bestSequenceScore = this.scoreFunction(this.botCopy, this.humanCopy);
    }
    AI.prototype.search = function (iterations) {
        var _this = this;
        var startTime = new Date();
        for (var i = 0; i < iterations; i++) {
            var movesList = [];
            var dummyBot = this.botCopy.clone();
            var dummyHuman = this.humanCopy.clone();
            dummyBot.opponent = dummyHuman;
            dummyHuman.opponent = dummyBot;
            dummyBot.refresh();
            dummyHuman.refresh();
            while (true) {
                var possibleMoves = dummyBot.validMoves();
                if (dummyBot.health == 0) {
                    break;
                }
                if (possibleMoves.length == 0) {
                    break;
                }
                possibleMoves.push(-1);
                var chosenMove = Random.fromArray(possibleMoves);
                if (chosenMove == -1) {
                    break;
                }
                dummyBot.useTool(chosenMove, dummyHuman);
                movesList.push(chosenMove);
            }
            dummyBot.endTurn();
            dummyHuman.endTurn();
            var consequence = this.scoreFunction(dummyBot, dummyHuman);
            if (consequence >= this.bestSequenceScore) {
                this.bestSequenceScore = consequence;
                this.bestSequence = movesList;
            }
        }
        debug(function () {
            var finishTime = new Date();
            var duration = finishTime.getTime() - startTime.getTime();
            console.log("Sim time (milliseconds): " + duration);
            console.log("Selected outcome utility: " + _this.bestSequenceScore);
        });
    };
    AI.bestMoveSequence = function (aiCombatant, humanCombatant, simIterations) {
        var sim = new AI(aiCombatant, humanCombatant);
        sim.search(simIterations);
        return sim.bestSequence;
    };
    AI.prototype.debugChosenSequence = function () {
        var dummyBot = this.botCopy.clone();
        var dummyHuman = this.humanCopy.clone();
        dummyBot.opponent = dummyHuman;
        dummyHuman.opponent = dummyBot;
        dummyBot.refresh();
        dummyHuman.refresh();
        console.log("Chosen sequence: " + this.bestSequence);
        this.bestSequence.forEach(function (move) {
            dummyBot.useTool(move, dummyHuman);
            console.log("Dummybot health: " + dummyBot.health);
            console.log("DummyHuman health: " + dummyHuman.health);
        });
        console.log("Ending turn simulation: ");
        dummyBot.endTurn();
        dummyHuman.endTurn();
        console.log("Dummybot health: " + dummyBot.health);
        console.log("DummyHuman health: " + dummyHuman.health);
        console.log("Evaluating with utility function:");
        console.log(this.scoreFunction);
        console.log("Assigned utility: " + this.scoreFunction(dummyBot, dummyHuman));
        console.log("Sim utility finding: " + this.bestSequenceScore);
    };
    __decorate([
        ondebug
    ], AI.prototype, "debugChosenSequence", null);
    return AI;
}());
var AbstractEffect = (function () {
    function AbstractEffect() {
    }
    AbstractEffect.prototype.activate = function (user, foe) {
        this.effect(user, foe);
    };
    return AbstractEffect;
}());
var CostTypes;
(function (CostTypes) {
    CostTypes[CostTypes["Health"] = 0] = "Health";
    CostTypes[CostTypes["Energy"] = 1] = "Energy";
    CostTypes[CostTypes["Battery"] = 2] = "Battery";
})(CostTypes || (CostTypes = {}));
var Cost = (function () {
    function Cost() {
        var costs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            costs[_i] = arguments[_i];
        }
        this.energyCost = 0;
        this.healthCost = 0;
        this.batteryCost = 0;
        for (var i = 0; i < costs.length; i++) {
            this.addTuple(costs[i]);
        }
    }
    Cost.prototype.magnitude = function () {
        return this.energyCost + this.healthCost + this.batteryCost;
    };
    Cost.prototype.addTuple = function (cost) {
        switch (cost[1]) {
            case CostTypes.Health:
                this.healthCost += cost[0];
                break;
            case CostTypes.Energy:
                this.energyCost += cost[0];
                break;
            case CostTypes.Battery:
                this.batteryCost += cost[0];
                break;
        }
    };
    Cost.prototype.toString = function () {
        var acc = [];
        if (this.energyCost > 0) {
            acc.push(this.energyCost + " Energy");
        }
        if (this.healthCost > 0) {
            acc.push(this.healthCost + " Health");
        }
        if (this.batteryCost > 0) {
            acc.push(this.batteryCost + " Battery");
        }
        if (acc.length === 0) {
            return 'Free';
        }
        return acc.join(', ');
    };
    Cost.prototype.addString = function () {
        var acc = [];
        if (this.energyCost > 0) {
            acc.push("+" + this.energyCost + " Energy Cost");
        }
        if (this.healthCost > 0) {
            acc.push("+" + this.healthCost + " Health Cost");
        }
        if (this.batteryCost > 0) {
            acc.push("+" + this.batteryCost + " Battery Cost");
        }
        return acc.join(', ');
    };
    Cost.prototype.scale = function (i) {
        this.healthCost *= i;
        this.energyCost *= i;
        this.batteryCost *= i;
    };
    Cost.prototype.addCost = function (c) {
        this.healthCost += c.healthCost;
        this.energyCost += c.energyCost;
        this.batteryCost += c.batteryCost;
    };
    Cost.prototype.clone = function () {
        var c = new Cost();
        c.addCost(this);
        return c;
    };
    return Cost;
}());
var Strings = (function () {
    function Strings() {
    }
    Strings.capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    };
    Strings.conjoin = function (strs) {
        return strs.map(function (x) { return Strings.capitalize(x) + "."; }).join(' ');
    };
    Strings.powerTuple = function (tuple) {
        if (tuple[1] <= 1) {
            return tuple[0];
        }
        return "" + tuple[0] + Strings.power(tuple[1]);
    };
    Strings.power = function (n) {
        var digits = ("" + n).split('').map(function (x) { return parseInt(x); });
        return digits.map(function (x) { return Strings.superscripts[x]; }).join('');
    };
    Strings.cssSanitize = function (str) {
        return str.split(' ').join('-');
    };
    Strings.superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    return Strings;
}());
var ToolMod = (function () {
    function ToolMod() {
    }
    return ToolMod;
}());
var UsesPerTurnMod = (function (_super) {
    __extends(UsesPerTurnMod, _super);
    function UsesPerTurnMod(n) {
        var _this = _super.call(this) || this;
        _this.num = n;
        return _this;
    }
    UsesPerTurnMod.prototype.apply = function (t) {
        t.usesPerTurn = this.num;
    };
    return UsesPerTurnMod;
}(ToolMod));
var UsesPerFightMod = (function (_super) {
    __extends(UsesPerFightMod, _super);
    function UsesPerFightMod(n) {
        var _this = _super.call(this) || this;
        _this.num = n;
        return _this;
    }
    UsesPerFightMod.prototype.apply = function (t) {
        t.usesPerFight = this.num;
    };
    return UsesPerFightMod;
}(ToolMod));
var Tool = (function () {
    function Tool(name, cost) {
        var effects = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            effects[_i - 2] = arguments[_i];
        }
        this._name = name;
        this.cost = cost;
        this.effects = [];
        this.modifiers = [];
        this.multiplier = 1;
        this.usesPerTurn = Infinity;
        this.usesPerFight = Infinity;
        for (var i = 0; i < effects.length; i++) {
            var curr = effects[i];
            if (curr instanceof AbstractEffect) {
                this.effects.push(curr);
            }
            else if (curr instanceof ToolMod) {
                curr.apply(this);
            }
        }
        this.usesLeftThisTurn = this.usesPerTurn;
        this.usesLeftThisTurn = this.usesLeftThisFight;
    }
    Object.defineProperty(Tool.prototype, "name", {
        get: function () {
            var multString = '';
            if (this.modifiers.length === 0) {
                return "" + this._name + multString;
            }
            return this.modifiers.map(Strings.powerTuple).join(' ') + " " + this._name + multString;
        },
        enumerable: true,
        configurable: true
    });
    Tool.prototype.usableBy = function (user) {
        return user.canAfford(this.cost) && this.usesLeftThisFight > 0 && this.usesLeftThisTurn > 0;
    };
    Tool.prototype.use = function (user, target) {
        if (!this.usableBy(user)) {
            return;
        }
        user.pay(this.cost);
        for (var i = 0; i < this.multiplier; i++) {
            for (var i_1 = 0; i_1 < this.effects.length; i_1++) {
                this.effects[i_1].activate(user, target);
            }
        }
        this.usesLeftThisTurn--;
        this.usesLeftThisFight--;
    };
    Tool.prototype.startFight = function () {
        this.usesLeftThisFight = this.usesPerFight;
    };
    Tool.prototype.refresh = function () {
        this.usesLeftThisTurn = this.usesPerTurn;
    };
    Tool.prototype.effectsString = function () {
        var acc = [];
        for (var i = 0; i < this.effects.length; i++) {
            acc.push(Strings.capitalize(this.effects[i].toString()) + '.');
        }
        return acc.join(' ');
    };
    Tool.prototype.addModifierString = function (str) {
        for (var i = 0; i < this.modifiers.length; i++) {
            if (this.modifiers[i][0] === str) {
                this.modifiers[i][1]++;
                return;
            }
        }
        this.modifiers.push([str, 1]);
    };
    Tool.prototype.clone = function () {
        var effectsClones = this.effects.map(function (x) { return x.clone(); });
        var t = new (Tool.bind.apply(Tool, __spreadArrays([void 0, this.name, this.cost.clone()], effectsClones)))();
        t.usesPerTurn = this.usesPerTurn;
        t.usesPerFight = this.usesPerFight;
        t.usesLeftThisTurn = this.usesLeftThisTurn;
        t.usesLeftThisFight = this.usesLeftThisFight;
        t.multiplier = this.multiplier;
        var modifiers = [];
        for (var i = 0; i < this.modifiers.length; i++) {
            modifiers[i] = [this.modifiers[i][0], this.modifiers[i][1]];
        }
        t.modifiers = modifiers;
        return t;
    };
    return Tool;
}());
var StatusCallbacks;
(function (StatusCallbacks) {
    StatusCallbacks["START_TURN"] = "startTurn";
    StatusCallbacks["END_TURN"] = "endTurn";
    StatusCallbacks["USE_TOOL"] = "useTool";
    StatusCallbacks["TAKE_DAMAGE"] = "takeDamage";
    StatusCallbacks["DIE"] = "die";
})(StatusCallbacks || (StatusCallbacks = {}));
var StatusFolds;
(function (StatusFolds) {
    StatusFolds["DAMAGE_TAKEN"] = "damageTakenFold";
    StatusFolds["DAMAGE_DEALT"] = "damageDealtFold";
    StatusFolds["AMOUNT_HEALED"] = "amountHealedFold";
    StatusFolds["ENERGY_GAINED"] = "energyGainedFold";
})(StatusFolds || (StatusFolds = {}));
var StatusValidators;
(function (StatusValidators) {
    StatusValidators[StatusValidators["NONZERO"] = 0] = "NONZERO";
    StatusValidators[StatusValidators["POSITIVE"] = 1] = "POSITIVE";
})(StatusValidators || (StatusValidators = {}));
var AbstractStatus = (function () {
    function AbstractStatus(amount, validator) {
        this.amount = amount;
        this.validator = validator;
    }
    AbstractStatus.prototype.startTurn = function (affected, other) {
    };
    AbstractStatus.prototype.endTurn = function (affected, other) {
    };
    AbstractStatus.prototype.useTool = function (affected, other) {
    };
    AbstractStatus.prototype.takeDamage = function (affected, other) {
    };
    AbstractStatus.prototype.die = function (affected, other) {
    };
    AbstractStatus.prototype.runsOut = function (affected, other) {
    };
    AbstractStatus.prototype.damageTakenFold = function (acc, affected) {
        return acc;
    };
    AbstractStatus.prototype.damageDealtFold = function (acc, affected) {
        return acc;
    };
    AbstractStatus.prototype.amountHealedFold = function (acc, affected) {
        return acc;
    };
    AbstractStatus.prototype.energyGainedFold = function (acc, affected) {
        return acc;
    };
    AbstractStatus.prototype.getDescriptionForPlayer = function () {
        return this.getDescription();
    };
    AbstractStatus.prototype.isValid = function () {
        switch (this.validator) {
            case StatusValidators.NONZERO:
                return this.amount !== 0;
            case StatusValidators.POSITIVE:
                return this.amount > 0;
        }
    };
    AbstractStatus.prototype.toString = function () {
        return this.amount + " " + Strings.capitalize(this.getName());
    };
    return AbstractStatus;
}());
var TraitMod = (function () {
    function TraitMod() {
    }
    return TraitMod;
}());
var GiveHealth = (function (_super) {
    __extends(GiveHealth, _super);
    function GiveHealth(n) {
        var _this = _super.call(this) || this;
        _this.amount = n;
        return _this;
    }
    GiveHealth.prototype.apply = function (c) {
        c.increaseMaxHealth(this.amount);
    };
    GiveHealth.prototype.remove = function (c) {
        c.decreaseMaxHealth(this.amount);
    };
    GiveHealth.prototype.toString = function () {
        return "increase max health by " + this.amount;
    };
    return GiveHealth;
}(TraitMod));
var ExtraScrip = (function (_super) {
    __extends(ExtraScrip, _super);
    function ExtraScrip(n) {
        var _this = _super.call(this) || this;
        _this.amount = n;
        return _this;
    }
    ExtraScrip.prototype.apply = function (c) {
        if (c instanceof Enemy) {
            c.lootMoney += this.amount;
        }
        else if (c instanceof Player) {
            c.extraScrip += this.amount;
        }
    };
    ExtraScrip.prototype.remove = function (c) {
        if (c instanceof Enemy) {
            c.lootMoney -= this.amount;
        }
        else if (c instanceof Player) {
            c.extraScrip -= this.amount;
        }
    };
    ExtraScrip.prototype.toString = function () {
        return "gain " + this.amount + " extra scrip from all sources";
    };
    return ExtraScrip;
}(TraitMod));
var Trait = (function () {
    function Trait(name) {
        var mods = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mods[_i - 1] = arguments[_i];
        }
        this.name = name;
        this.appliedStatuses = mods.filter(function (x) { return x instanceof AbstractStatus; });
        this.traitMods = mods.filter(function (x) { return x instanceof TraitMod; });
    }
    Trait.prototype.apply = function (c) {
        this.traitMods.forEach(function (tm) { return tm.apply(c); });
    };
    Trait.prototype.remove = function (c) {
        this.traitMods.forEach(function (tm) { return tm.remove(c); });
    };
    Trait.prototype.startFight = function (c) {
        var statusClones = this.appliedStatuses.map(function (x) { return x.clone(); });
        statusClones.forEach(function (status) { return c.addStatus(status); });
    };
    Trait.prototype.removeEffects = function (c) {
        var statusClones = this.appliedStatuses.map(function (x) { return x.clone(); });
        statusClones.forEach(function (status) { return status.amount *= -1; });
        statusClones.forEach(function (status) { return c.addStatus(status); });
    };
    Trait.prototype.clone = function () {
        var t = new (Trait.bind.apply(Trait, __spreadArrays([void 0, this.name], this.appliedStatuses.map(function (x) { return x.clone(); }))))();
        t.traitMods = this.traitMods;
        return t;
    };
    Trait.prototype.describe = function () {
        var acc = this.traitMods.map(function (tm) { return tm.toString(); });
        if (this.appliedStatuses.length > 0) {
            acc.push("start fights with " + this.appliedStatuses.map(function (x) { return x.toString(); }).join(', '));
        }
        return Strings.conjoin(acc);
    };
    return Trait;
}());
var Combatant = (function () {
    function Combatant(name, health, energy, tools, traits, image) {
        var _this = this;
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.energy = energy;
        this.maxEnergy = energy;
        this.tools = tools;
        this.traits = [];
        traits.forEach(function (trait) { return _this.addTrait(trait); });
        this.deathFunc = function () { };
        this.afterToolFunc = function () { };
        this.statuses = [];
        this.imageSrc = image;
        this.specialDamageFunction = function (x) { };
    }
    ;
    Combatant.prototype.startFight = function (other) {
        var _this = this;
        this.opponent = other;
        this.statuses = [];
        this.traits.forEach(function (trait) {
            for (var i = 0; i < trait[1]; i++) {
                trait[0].startFight(_this);
            }
        });
        this.tools.forEach(function (tool) { return tool.startFight(); });
        this.refresh();
    };
    Combatant.prototype.endFight = function () {
        this.statuses = [];
    };
    Combatant.prototype.startTurn = function () {
        this.refresh();
        this.statusCallback(StatusCallbacks.START_TURN);
    };
    Combatant.prototype.endTurn = function () {
        this.statusCallback(StatusCallbacks.END_TURN);
    };
    Combatant.prototype.status = function () {
        return this.name + ": " + this.health + " / " + this.maxHealth;
    };
    ;
    Combatant.prototype.wound = function (damage) {
        this.directDamage(this.statusFold(StatusFolds.DAMAGE_TAKEN, damage));
    };
    ;
    Combatant.prototype.directDamage = function (damage) {
        if (damage === 0) {
            return;
        }
        if (damage > this.health) {
            damage = this.health;
        }
        this.health -= damage;
        this.statusCallback(StatusCallbacks.TAKE_DAMAGE);
        this.specialDamageFunction(damage);
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    };
    Combatant.prototype.heal = function (amount) {
        this.directHeal(this.statusFold(StatusFolds.AMOUNT_HEALED, amount));
    };
    Combatant.prototype.directHeal = function (amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    };
    Combatant.prototype.refresh = function () {
        this.gainEnergy(this.maxEnergy - this.energy);
        for (var i = 0; i < this.tools.length; i++) {
            this.tools[i].refresh();
        }
    };
    Combatant.prototype.canAfford = function (cost) {
        return this.health > cost.healthCost && this.energy >= cost.energyCost
            && this.getBatteryAmount() >= cost.batteryCost;
    };
    Combatant.prototype.getBatteryAmount = function () {
        return this.statuses.filter(function (status) { return status.getName() === 'battery'; }).reduce(function (acc, val) { return acc + val.amount; }, 0);
    };
    Combatant.prototype.payBatteryAmount = function (amount) {
        for (var i = 0; i < this.statuses.length; i++) {
            if (this.statuses[i].getName() === 'battery') {
                this.statuses[i].amount -= amount;
                break;
            }
        }
        this.statusBookkeeping();
    };
    Combatant.prototype.gainEnergy = function (amount) {
        this.energy += this.statusFold(StatusFolds.ENERGY_GAINED, amount);
    };
    Combatant.prototype.loseEnergy = function (amount) {
        this.energy = Math.max(this.energy - amount, 0);
    };
    Combatant.prototype.pay = function (cost) {
        this.directDamage(cost.healthCost);
        this.energy -= cost.energyCost;
        this.payBatteryAmount(cost.batteryCost);
    };
    ;
    Combatant.prototype.validMoves = function () {
        var result = [];
        for (var i = 0; i < this.tools.length; i++) {
            if (this.tools[i].usableBy(this)) {
                result.push(i);
            }
        }
        return result;
    };
    Combatant.prototype.useTool = function (index, target) {
        if (index < 0 || index > this.tools.length) {
            return;
        }
        var tool = this.tools[index];
        this.statusCallback(StatusCallbacks.USE_TOOL);
        tool.use(this, target);
        this.afterToolFunc();
    };
    ;
    Combatant.prototype.die = function () {
        this.statusCallback(StatusCallbacks.DIE);
        if (this.health <= 0) {
            this.actuallyDie();
        }
    };
    Combatant.prototype.actuallyDie = function () {
        this.health = 0;
        this.deathFunc.call(this);
    };
    Combatant.prototype.setDeathFunc = function (f) {
        this.deathFunc = f;
    };
    Combatant.prototype.setAfterToolFunc = function (f) {
        this.afterToolFunc = f;
    };
    Combatant.prototype.addStatus = function (status) {
        for (var i = 0; i < this.statuses.length; i++) {
            var done = this.statuses[i].add(status);
            if (done) {
                return;
            }
        }
        this.statuses.push(status);
        this.statusBookkeeping();
    };
    Combatant.prototype.getStatusAmount = function (query) {
        var matches = this.statuses.filter(function (status) { return status.sameKind(query); });
        return matches.reduce(function (acc, val) { return acc + val.amount; }, 0);
    };
    Combatant.prototype.removeStatus = function (remove) {
        var _this = this;
        this.statuses.filter(function (status) { return status.sameKind(remove); }).forEach(function (status) {
            status.runsOut(_this, _this.opponent);
        });
        this.statuses = this.statuses.filter(function (status) { return !status.sameKind(remove); });
    };
    Combatant.prototype.addTrait = function (trait) {
        trait.apply(this);
        for (var i = 0; i < this.traits.length; i++) {
            var current = this.traits[i];
            if (current[0].name === trait.name) {
                current[1] = current[1] + 1;
                return;
            }
        }
        this.traits.push([trait, 1]);
    };
    Combatant.prototype.removeTrait = function (index) {
        var traitTuple = this.traits[index];
        traitTuple[0].remove(this);
        traitTuple[1]--;
        if (traitTuple[1] <= 0) {
            this.traits.splice(index, 1);
        }
    };
    Combatant.prototype.statusCallback = function (callback) {
        var _this = this;
        var callbacks = this.statuses.map(function (x) { return x[callback].bind(x); });
        callbacks.forEach(function (x) { return x(_this, _this.opponent); });
        this.statusBookkeeping();
    };
    Combatant.prototype.statusFold = function (fold, value) {
        var _this = this;
        var foldingCallbacks = this.statuses.map(function (x) { return x[fold].bind(x); });
        var result = foldingCallbacks.reduce(function (acc, x) { return x(acc, _this); }, value);
        this.statusBookkeeping();
        return result;
    };
    Combatant.prototype.increaseMaxHealth = function (amount) {
        this.maxHealth += amount;
        this.health += amount;
    };
    Combatant.prototype.decreaseMaxHealth = function (amount) {
        this.maxHealth -= amount;
        this.maxHealth = Math.max(1, this.maxHealth);
        this.health = Math.min(this.health, this.maxHealth);
    };
    Combatant.prototype.increaseMaxEnergy = function (amount) {
        this.maxEnergy += amount;
        this.energy += amount;
    };
    Combatant.prototype.decreaseMaxEnergy = function (amount) {
        this.maxEnergy -= amount;
        this.maxEnergy = Math.max(1, this.maxEnergy);
        this.energy = Math.min(this.energy, this.maxEnergy);
    };
    Combatant.prototype.statusBookkeeping = function () {
        var _this = this;
        this.statuses.filter(function (status) { return !status.isValid(); }).forEach(function (x) { return x.runsOut(_this, _this.opponent); });
        this.statuses = this.statuses.filter(function (status) { return status.isValid(); });
        this.statuses = this.statuses.sort(function (a, b) { return a.getSortingNumber() - b.getSortingNumber(); });
    };
    return Combatant;
}());
var AbstractCombatPredicate = (function () {
    function AbstractCombatPredicate() {
    }
    AbstractCombatPredicate.prototype.clone = function () {
        return this;
    };
    return AbstractCombatPredicate;
}());
var AiUtilityFunctions = (function () {
    function AiUtilityFunctions() {
    }
    AiUtilityFunctions.genericUtility = function (bot, human, aggression) {
        if (AiUtilityFunctions.dead(bot)) {
            return this.worstValue;
        }
        if (AiUtilityFunctions.dead(human)) {
            return this.bestValue;
        }
        var botStatusPoints = AiUtilityFunctions.statusUtilityPoints(bot);
        var humanStatusPoints = AiUtilityFunctions.statusUtilityPoints(human);
        var statusPoints = botStatusPoints - (humanStatusPoints * aggression);
        var healthDifferencePoints = (bot.health - human.health * aggression);
        return statusPoints + healthDifferencePoints;
    };
    AiUtilityFunctions.aggressiveUtility = function (bot, human) {
        return AiUtilityFunctions.genericUtility(bot, human, 10);
    };
    AiUtilityFunctions.cautiousUtility = function (bot, human) {
        return AiUtilityFunctions.genericUtility(bot, human, 1);
    };
    AiUtilityFunctions.defensiveUtility = function (bot, human) {
        return AiUtilityFunctions.genericUtility(bot, human, 0.25);
    };
    AiUtilityFunctions.suicidalUtility = function (bot, human) {
        return -1 * (bot.health + AiUtilityFunctions.statusUtilityPoints(bot));
    };
    AiUtilityFunctions.blindUtility = function (bot, human) {
        return this.bestValue;
    };
    AiUtilityFunctions.friendlyUtility = function (bot, human) {
        if (bot.health == 0 || human.health == 0) {
            return AiUtilityFunctions.worstValue;
        }
        var botStatusPoints = AiUtilityFunctions.statusUtilityPoints(bot);
        var humanStatusPoints = AiUtilityFunctions.statusUtilityPoints(human);
        var statusPoints = botStatusPoints + humanStatusPoints;
        var healthPoints = (bot.health + human.health);
        return statusPoints + healthPoints;
    };
    AiUtilityFunctions.dead = function (combatant) {
        return combatant.health == 0;
    };
    AiUtilityFunctions.statusUtilityPoints = function (combatant) {
        return combatant.statuses.reduce(function (sum, current) { return (sum + current.getUtility()); }, 0);
    };
    AiUtilityFunctions.worstValue = Number.NEGATIVE_INFINITY;
    AiUtilityFunctions.bestValue = Number.POSITIVE_INFINITY;
    return AiUtilityFunctions;
}());
var Arrays = (function () {
    function Arrays() {
    }
    Arrays.flatten = function (arr) {
        return arr.reduce(function (acc, x) {
            if (acc === void 0) { acc = []; }
            return acc.concat(x);
        });
    };
    Arrays.generate = function (length, func) {
        var result = new Array(length);
        for (var i = 0; i < length; i++) {
            result[i] = func();
        }
        return result;
    };
    Arrays.filterInPlace = function (arr, pred) {
        var i = 0;
        var j = 0;
        while (i < arr.length) {
            var x = arr[i];
            if (pred(x)) {
                arr[j++] = x;
            }
            i++;
        }
        arr.length = j;
    };
    return Arrays;
}());
var Coordinates = (function () {
    function Coordinates(c) {
        this.x = c.x;
        this.y = c.y;
    }
    Coordinates.prototype.surroundingCoords = function () {
        var _this = this;
        var offsets = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        return offsets.map(function (o) { return _this.applyOffset(o); });
    };
    Coordinates.prototype.applyOffset = function (offset) {
        return new Coordinates({ x: this.x + offset[0], y: this.y + offset[1] });
    };
    Coordinates.prototype.calculateOffset = function (other) {
        return [other.x - this.x, other.y - this.y];
    };
    Coordinates.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };
    Coordinates.prototype.toString = function () {
        return "(" + this.x + ", " + this.y + ")";
    };
    return Coordinates;
}());
var CreditsEntry = (function () {
    function CreditsEntry(name) {
        var roles = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            roles[_i - 1] = arguments[_i];
        }
        this.name = name;
        this.roles = roles;
    }
    return CreditsEntry;
}());
var Direction;
(function (Direction) {
    Direction[Direction["Right"] = 0] = "Right";
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Down"] = 3] = "Down";
})(Direction || (Direction = {}));
var Directions;
(function (Directions) {
    function values() {
        return Object.keys(Direction).map(function (n) { return parseInt(n); }).filter(function (n) { return !isNaN(n); });
    }
    Directions.values = values;
    function getOffset(dir) {
        switch (dir) {
            case Direction.Up:
                return [0, -1];
            case Direction.Down:
                return [0, 1];
            case Direction.Left:
                return [-1, 0];
            case Direction.Right:
                return [1, 0];
        }
    }
    Directions.getOffset = getOffset;
    function fromKey(code) {
        switch (code) {
            case "ArrowLeft":
                return Direction.Left;
            case "ArrowUp":
                return Direction.Up;
            case "ArrowRight":
                return Direction.Right;
            case "ArrowDown":
                return Direction.Down;
            default:
                return undefined;
        }
    }
    Directions.fromKey = fromKey;
})(Directions || (Directions = {}));
var Random = (function () {
    function Random() {
    }
    Random.bool = function (chance) {
        if (chance === void 0) { chance = 0.5; }
        return Math.random() < chance;
    };
    Random.between = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    Random.intBetween = function (min, max) {
        return Random.between(min, max) << 0;
    };
    Random.tupleInt = function (tuple) {
        return Random.intBetween(tuple[0], tuple[1]);
    };
    Random.lessThan = function (max) {
        return Random.between(0, max);
    };
    Random.intLessThan = function (max) {
        return Random.intBetween(0, max);
    };
    Random.intCoord = function (width, height) {
        return new Coordinates({
            x: Random.intLessThan(width),
            y: Random.intLessThan(height)
        });
    };
    Random.fromArray = function (arr) {
        return arr[Random.intBetween(0, arr.length)];
    };
    Random.weightedRandom = function (arr) {
        var totalWeight = arr.map(function (x) { return x[1]; }).reduce(function (acc, x) { return acc + x; });
        var weight = Random.between(0, totalWeight);
        var totalIndex = 0;
        for (var i = 0; i < arr.length; i++) {
            totalIndex += arr[i][1];
            if (totalIndex >= weight) {
                return arr[i][0];
            }
        }
        return arr[0][0];
    };
    Random.shuffle = function (arr) {
        for (var i = 0; i < arr.length - 2; i++) {
            var j = Random.intBetween(i, arr.length);
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    };
    Random.fromNumericEnum = function (e) {
        var keys = Object.keys(e).map(function (n) { return Number(n); }).filter(function (n) { return !isNaN(n); });
        return Random.fromArray(keys);
    };
    return Random;
}());
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(name, health, energy, defaultUtilityFunction, tools, traits, image) {
        var _this = _super.call(this, name, health, energy, tools, traits, image) || this;
        if (defaultUtilityFunction == undefined) {
            _this.utilityFunction = AiUtilityFunctions.cautiousUtility;
        }
        else {
            _this.utilityFunction = defaultUtilityFunction;
        }
        _this.lootTraits = [];
        _this.lootModifiers = [];
        _this.lootMoney = 0;
        _this.isFinalBoss = false;
        return _this;
    }
    Enemy.prototype.clone = function () {
        var copy = new Enemy(this.name, this.health, this.energy, this.utilityFunction, this.tools.map(function (x) { return x.clone(); }), [], this.imageSrc);
        this.traits.forEach(function (tuple) {
            for (var i = 0; i < tuple[1]; i++) {
                copy.addTrait(tuple[0].clone());
            }
        });
        copy.statuses = this.statuses.map(function (x) { return x.clone(); });
        copy.utilityFunction = this.utilityFunction;
        return copy;
    };
    Enemy.prototype.addLootTrait = function (t) {
        this.addTrait(t);
        this.lootTraits.push(t);
    };
    Enemy.prototype.addLootModifier = function (m) {
        var tool = Random.fromArray(this.tools);
        m.apply(tool);
        this.lootModifiers.push(m);
    };
    Enemy.prototype.setLootMoney = function (x) {
        this.lootMoney = x;
    };
    return Enemy;
}(Combatant));
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(name, health, energy, tools, traits, image, floorIcon) {
        var _this = _super.call(this, name, health, energy, tools, traits, image) || this;
        _this.currency = 0;
        _this.extraScrip = 0;
        _this.floorIcon = floorIcon;
        return _this;
    }
    Player.prototype.giveCurrency = function (x) {
        x = Math.max(x + this.extraScrip, 0);
        this.currency += x;
        Game.currentRun.addStatistic(RunStatistics.SCRIP_EARNED, x);
    };
    Player.prototype.payCurrency = function (x) {
        if (x > this.currency) {
            x = this.currency;
        }
        this.currency -= x;
        Game.currentRun.addStatistic(RunStatistics.SCRIP_SPENT, x);
    };
    Player.prototype.clone = function () {
        var p = new Player(this.name, this.health, this.energy, this.tools.map(function (x) { return x.clone(); }), [], this.imageSrc, this.floorIcon);
        this.traits.forEach(function (tuple) {
            for (var i = 0; i < tuple[1]; i++) {
                p.addTrait(tuple[0].clone());
            }
        });
        p.statuses = this.statuses.map(function (x) { return x.clone(); });
        p.currency = this.currency;
        p.extraScrip = this.extraScrip;
        return p;
    };
    return Player;
}(Combatant));
var SoundEffects;
(function (SoundEffects) {
    SoundEffects["Noise"] = "noise.ogg";
    SoundEffects["Modifier"] = "Modifier.ogg";
    SoundEffects["Trait"] = "Trait.ogg";
})(SoundEffects || (SoundEffects = {}));
var MusicTracks;
(function (MusicTracks) {
    MusicTracks["Foyer"] = "the_foyer.ogg";
    MusicTracks["MainTheme"] = "main_theme.ogg";
    MusicTracks["ProtoInh"] = "the_prototype_inheritance.ogg";
})(MusicTracks || (MusicTracks = {}));
var SoundManager = (function () {
    function SoundManager() {
    }
    SoundManager.init = function () {
        var _this = this;
        var newAudioElement = function () { return document.createElement('audio'); };
        this.sfxElems = {
            'noise.ogg': newAudioElement(),
            'Modifier.ogg': newAudioElement(),
            'Trait.ogg': newAudioElement(),
        };
        this.musicElems = {
            'main_theme.ogg': newAudioElement(),
            'the_foyer.ogg': newAudioElement(),
            'the_prototype_inheritance.ogg': newAudioElement()
        };
        var container = document.getElementById('audio');
        Object.keys(SoundEffects).forEach(function (key) {
            var filename = SoundEffects[key];
            var filepath = "assets/sfx/" + filename;
            var audio = _this.sfxElems[filename];
            audio.preload = 'auto';
            audio.src = filepath;
            container.appendChild(audio);
        });
        Object.keys(MusicTracks).forEach(function (key) {
            var filename = MusicTracks[key];
            var filepath = "assets/music/" + filename;
            var audio = _this.musicElems[filename];
            audio.preload = 'auto';
            audio.loop = 'true';
            audio.src = filepath;
            container.appendChild(audio);
        });
        this.currentSong = false;
    };
    SoundManager.setVolume = function (volume) {
        var _this = this;
        Object.keys(SoundEffects).forEach(function (key) {
            _this.sfxElems[SoundEffects[key]].volume = volume;
        });
        Object.keys(MusicTracks).forEach(function (key) {
            _this.musicElems[MusicTracks[key]].volume = volume;
        });
    };
    SoundManager.playSoundEffect = function (sfx) {
        this.sfxElems[sfx].currentTime = 0;
        this.sfxElems[sfx].play();
    };
    SoundManager.playSong = function (song) {
        if (song === this.currentSong) {
            return;
        }
        if (this.currentSong !== false) {
            this.musicElems[this.currentSong].pause();
        }
        this.musicElems[song].currentTime = 0;
        this.musicElems[song].play();
        this.currentSong = song;
    };
    return SoundManager;
}());
var RoomIcon;
(function (RoomIcon) {
    RoomIcon["ENEMY"] = "tiles/items and misc tiles/enemy.png";
    RoomIcon["EXIT"] = "tiles/items and misc tiles/exit.png";
    RoomIcon["MODIFIER"] = "tiles/items and misc tiles/modifier.png";
    RoomIcon["SHOP"] = "tiles/items and misc tiles/shop.png";
    RoomIcon["TRAIT"] = "tiles/items and misc tiles/trait.png";
    RoomIcon["NONE"] = "";
    RoomIcon["TOOL"] = "tiles/items and misc tiles/enemy.png";
    RoomIcon["BOSS"] = "tiles/items and misc tiles/boss.png";
    RoomIcon["GOLDFISH"] = "tiles/items and misc tiles/goldfish.png";
    RoomIcon["Collectible"] = "tiles/items and misc tiles/note.png";
})(RoomIcon || (RoomIcon = {}));
var RoomEvent = (function () {
    function RoomEvent() {
    }
    RoomEvent.parseWeights = function (weights) {
        return weights.map(function (w) { return [w.name, w.weight]; });
    };
    return RoomEvent;
}());
var EmptyRoomEvent = (function (_super) {
    __extends(EmptyRoomEvent, _super);
    function EmptyRoomEvent(roomType) {
        var _this = _super.call(this) || this;
        _this.roomType = RoomType.Empty;
        _this.roomIcon = RoomIcon.NONE;
        _this.roomType = roomType;
        return _this;
    }
    EmptyRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        room.containerFloor.redraw();
        return this;
    };
    return EmptyRoomEvent;
}(RoomEvent));
var ExitRoomEvent = (function (_super) {
    __extends(ExitRoomEvent, _super);
    function ExitRoomEvent() {
        var _this = _super.call(this) || this;
        _this.roomType = RoomType.Exit;
        _this.roomIcon = RoomIcon.EXIT;
        return _this;
    }
    ExitRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        Game.currentRun.nextFloor();
        return this;
    };
    return ExitRoomEvent;
}(RoomEvent));
var ToolRoomEvent = (function (_super) {
    __extends(ToolRoomEvent, _super);
    function ToolRoomEvent(tool) {
        var _this = _super.call(this) || this;
        _this.tool = tool;
        _this.roomType = RoomType.Tool;
        _this.roomIcon = RoomIcon.TOOL;
        return _this;
    }
    ToolRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        room.containerFloor.redraw();
        return new EmptyRoomEvent(RoomType.Empty);
    };
    return ToolRoomEvent;
}(RoomEvent));
var EnemyRoomEvent = (function (_super) {
    __extends(EnemyRoomEvent, _super);
    function EnemyRoomEvent(enemy, recoveryTime) {
        var _this = _super.call(this) || this;
        _this.enemy = enemy;
        _this.recoveryTime = recoveryTime;
        _this.roomType = RoomType.Enemy;
        _this.roomIcon = RoomIcon.ENEMY;
        _this.lastEntered = 0;
        _this.firstEntry = true;
        return _this;
    }
    EnemyRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        if (this.firstEntry || (this.recoveryTime !== undefined && (roomsEntered - this.lastEntered) > this.recoveryTime)) {
            this.lastEntered = roomsEntered;
            if (this.firstEntry) {
                this.firstEntry = false;
            }
            else {
                this.enemy.heal(this.enemy.maxHealth);
            }
            new Fight(room.containerFloor.currentRun.player, this.enemy, room);
        }
        else {
            room.containerFloor.redraw();
        }
        if (!this.recoveryTime || this.recoveryTime === Infinity) {
            return new EmptyRoomEvent(RoomType.Empty);
        }
        return this;
    };
    return EnemyRoomEvent;
}(RoomEvent));
var ModifierRoomEvent = (function (_super) {
    __extends(ModifierRoomEvent, _super);
    function ModifierRoomEvent(m) {
        var _this = _super.call(this) || this;
        _this.roomType = RoomType.Modifier;
        _this.roomIcon = RoomIcon.MODIFIER;
        _this.modifier = m;
        return _this;
    }
    ModifierRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        UI.fillScreen(UI.renderModifier(this.modifier, Game.currentRun.player, function (taken) {
            if (taken) {
                room.clearEvent();
            }
            room.containerFloor.redraw();
        }));
        return this;
    };
    return ModifierRoomEvent;
}(RoomEvent));
var TraitRoomEvent = (function (_super) {
    __extends(TraitRoomEvent, _super);
    function TraitRoomEvent(t) {
        var _this = _super.call(this) || this;
        _this.roomType = RoomType.Trait;
        _this.roomIcon = RoomIcon.TRAIT;
        _this.trait = t;
        return _this;
    }
    TraitRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        UI.fillScreen(UI.renderTrait(this.trait, Game.currentRun.player, function (taken) {
            if (taken) {
                room.clearEvent();
            }
            room.containerFloor.redraw();
        }));
        return this;
    };
    return TraitRoomEvent;
}(RoomEvent));
var ShopRoomEvent = (function (_super) {
    __extends(ShopRoomEvent, _super);
    function ShopRoomEvent(shop) {
        var _this = _super.call(this) || this;
        _this.roomType = RoomType.Shop;
        _this.roomIcon = RoomIcon.SHOP;
        _this.shop = shop;
        return _this;
    }
    ShopRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        UI.fillScreen(UI.renderShopMenu(this.shop, Game.currentRun.player, function () {
            room.containerFloor.redraw();
        }));
        return this;
    };
    return ShopRoomEvent;
}(RoomEvent));
var CollectibleRoomEvent = (function (_super) {
    __extends(CollectibleRoomEvent, _super);
    function CollectibleRoomEvent(scripRewardRange) {
        var _this = _super.call(this) || this;
        _this.roomType = RoomType.Collectible;
        _this.roomIcon = RoomIcon.Collectible;
        _this.scripRewardRange = scripRewardRange;
        return _this;
    }
    CollectibleRoomEvent.prototype.onRoomEnter = function (room, roomsEntered) {
        var note = NotePool.unlockNewNote();
        if (note) {
            UI.fillScreen(UI.renderNote(function () { return room.containerFloor.redraw(); }, note));
        }
        else {
            var reward = Random.tupleInt(this.scripRewardRange);
            Game.currentRun.player.giveCurrency(reward);
            UI.fillScreen(UI.renderScripReward(function () { return room.containerFloor.redraw(); }, reward));
        }
        return new EmptyRoomEvent(RoomType.Empty);
    };
    return CollectibleRoomEvent;
}(RoomEvent));
var Room = (function () {
    function Room(containerFloor, coordinates, roomEvent, entrance) {
        this.containerFloor = containerFloor;
        this.coordinates = coordinates;
        this.roomEvent = roomEvent;
        this.exits = entrance ? [entrance] : [];
        this.distanceFromEntrance = entrance ? entrance.distanceFromEntrance + 1 : 0;
        this.visited = false;
        this.seen = false;
    }
    Room.prototype.continueFloor = function () {
        this.containerFloor.redraw();
    };
    Room.prototype.enter = function () {
        Game.currentRun.movePlayer(this.coordinates);
        Room.roomsEntered++;
        this.visited = true;
        this.exits.forEach(function (room) { return room.seen = true; });
        this.roomEvent = this.roomEvent.onRoomEnter(this, Room.roomsEntered);
    };
    Room.prototype.getRoomType = function () {
        return this.roomEvent.roomType;
    };
    Room.prototype.getIcon = function () {
        return this.roomEvent.roomIcon;
    };
    Room.prototype.hasFurtherNeighbors = function () {
        var _this = this;
        return this.exits.some(function (exit) { return exit.distanceFromEntrance > _this.distanceFromEntrance; });
    };
    Room.prototype.getExitCoordinates = function () {
        return this.exits.map(function (e) { return e.coordinates; });
    };
    Room.prototype.getBlockedCoordinates = function () {
        var exitCoords = this.getExitCoordinates();
        var surrounding = this.coordinates.surroundingCoords();
        return surrounding.filter(function (x) { return !exitCoords.some(function (c) { return x.equals(c); }); });
    };
    Room.prototype.getBlockedDirections = function () {
        var _this = this;
        var directions = Directions.values();
        var exitCoords = this.getExitCoordinates();
        return directions.filter(function (d) {
            var offset = Directions.getOffset(d);
            var coord = _this.coordinates.applyOffset(offset);
            return !exitCoords.some(function (c) { return coord.equals(c); });
        });
    };
    Room.prototype.clearEvent = function () {
        this.roomEvent = new EmptyRoomEvent(RoomType.Empty);
    };
    Room.roomsEntered = 0;
    return Room;
}());
var RoomType;
(function (RoomType) {
    RoomType["Empty"] = "empty";
    RoomType["Entrance"] = "entrance";
    RoomType["Exit"] = "exit";
    RoomType["Enemy"] = "enemy";
    RoomType["Tool"] = "tool";
    RoomType["Modifier"] = "modifier";
    RoomType["Trait"] = "trait";
    RoomType["Shop"] = "shop";
    RoomType["Collectible"] = "Collectible";
})(RoomType || (RoomType = {}));
var ModifierTypes;
(function (ModifierTypes) {
    ModifierTypes[ModifierTypes["CostMult"] = 0] = "CostMult";
    ModifierTypes[ModifierTypes["MultAdd"] = 1] = "MultAdd";
    ModifierTypes[ModifierTypes["AddEnergyCost"] = 2] = "AddEnergyCost";
    ModifierTypes[ModifierTypes["Effect"] = 3] = "Effect";
    ModifierTypes[ModifierTypes["UsesPerTurn"] = 4] = "UsesPerTurn";
    ModifierTypes[ModifierTypes["EnergyToHealth"] = 5] = "EnergyToHealth";
})(ModifierTypes || (ModifierTypes = {}));
var Modifier = (function () {
    function Modifier(name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.name = name;
        this.effects = [];
        this.costMultiplier = 1;
        this.multiplierAdd = 0;
        this.usesPerTurn = Infinity;
        this.transferEnergyToHealth = false;
        this.costAdd = new Cost();
        for (var i = 0; i < args.length; i++) {
            var curr = args[i];
            if (curr instanceof AbstractEffect) {
                this.effects.push(curr);
            }
            else if (curr instanceof Array && typeof curr[0] === 'number' && typeof curr[1] === 'number') {
                this.addTuple(curr);
            }
        }
    }
    Modifier.prototype.addTuple = function (t) {
        switch (t[0]) {
            case ModifierTypes.CostMult:
                this.costMultiplier = t[1];
                break;
            case ModifierTypes.MultAdd:
                this.multiplierAdd = t[1];
                break;
            case ModifierTypes.AddEnergyCost:
                this.costAdd.addTuple([t[1], CostTypes.Energy]);
                break;
            case ModifierTypes.UsesPerTurn:
                this.usesPerTurn = t[1];
                break;
            case ModifierTypes.EnergyToHealth:
                this.transferEnergyToHealth = true;
                break;
        }
    };
    Modifier.prototype.apply = function (t) {
        t.addModifierString(this.name);
        t.cost.scale(this.costMultiplier);
        t.cost.addCost(this.costAdd);
        t.multiplier += this.multiplierAdd;
        t.usesPerTurn = Math.min(this.usesPerTurn, t.usesPerTurn);
        if (this.transferEnergyToHealth) {
            t.cost.healthCost += t.cost.energyCost;
            t.cost.energyCost = 0;
        }
        for (var i = 0; i < this.effects.length; i++) {
            t.effects.push(this.effects[i].clone());
        }
        return t;
    };
    Modifier.prototype.describe = function () {
        var acc = [];
        if (this.costMultiplier !== 1) {
            acc.push("cost x" + this.costMultiplier);
        }
        if (this.multiplierAdd > 0) {
            acc.push("multiplier +" + this.multiplierAdd);
        }
        if (this.costAdd.magnitude() > 0) {
            acc.push(this.costAdd.addString());
        }
        if (this.usesPerTurn < Infinity) {
            acc.push("limited to " + this.usesPerTurn + " use(s) per turn");
        }
        if (this.transferEnergyToHealth) {
            acc.push('costs health instead of energy');
        }
        if (this.effects.length > 0) {
            var effectStrings = this.effects.map(function (x) { return x.toString(); });
            acc.push("Add effect(s): " + effectStrings.map(function (x) { return Strings.capitalize(x); }).join('. ') + ".");
        }
        return Strings.conjoin(acc);
    };
    Modifier.prototype.clone = function () {
        return this;
    };
    return Modifier;
}());
var ItemPoolEntry = (function () {
    function ItemPoolEntry(key, value, num) {
        var tags = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            tags[_i - 3] = arguments[_i];
        }
        this.key = key;
        this.value = value;
        this.tags = tags;
        this.sortingNumber = num;
    }
    ItemPoolEntry.prototype.get = function () {
        return this.value.clone();
    };
    ItemPoolEntry.prototype.hasTags = function () {
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        return tags.length === 0 || this.tags.some(function (x) { return tags.indexOf(x) !== -1; });
    };
    return ItemPoolEntry;
}());
var ItemPool = (function () {
    function ItemPool(sorted) {
        if (sorted === void 0) { sorted = false; }
        this.items = {};
        this.keys = [];
        this.sorted = sorted;
    }
    ItemPool.prototype.add = function (key, item) {
        var tags = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            tags[_i - 2] = arguments[_i];
        }
        this.items[key] = new (ItemPoolEntry.bind.apply(ItemPoolEntry, __spreadArrays([void 0, key, item, 0], tags)))();
        this.keys.push(key);
    };
    ItemPool.prototype.addSorted = function (key, item, position) {
        var tags = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            tags[_i - 3] = arguments[_i];
        }
        this.items[key] = new (ItemPoolEntry.bind.apply(ItemPoolEntry, __spreadArrays([void 0, key, item, position], tags)))();
        this.keys.push(key);
    };
    ItemPool.prototype.get = function (key) {
        if (this.items[key] === undefined) {
            return null;
        }
        return this.items[key].get();
    };
    ItemPool.prototype.getRandom = function () {
        var key = Random.fromArray(this.keys);
        return this.get(key);
    };
    ItemPool.prototype.selectUnseenTags = function (seen, tags) {
        var _this = this;
        if (tags === void 0) { tags = []; }
        var fallbacks = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            fallbacks[_i - 2] = arguments[_i];
        }
        var unseen = function (k) { return seen.indexOf(k) < 0; };
        var unseenMatching = [];
        var tagsMatch = this.keys.filter(function (k) {
            var _a;
            return (_a = _this.items[k]).hasTags.apply(_a, tags);
        });
        var _loop_1 = function (ts) {
            var matching = this_1.keys.filter(function (k) {
                var _a;
                return unseen(k) && (_a = _this.items[k]).hasTags.apply(_a, ts);
            });
            if (matching.length > 0) {
                unseenMatching = matching;
                return "break";
            }
        };
        var this_1 = this;
        for (var _a = 0, _b = __spreadArrays([tags], fallbacks); _a < _b.length; _a++) {
            var ts = _b[_a];
            var state_1 = _loop_1(ts);
            if (state_1 === "break")
                break;
        }
        if (unseenMatching.length == 0) {
            Arrays.filterInPlace(seen, function (k) {
                var _a;
                return (_a = _this.items[k]).hasTags.apply(_a, tags);
            });
            return tagsMatch;
        }
        return unseenMatching;
    };
    ItemPool.prototype.selectAllUnseen = function (seen, tags) {
        var _this = this;
        if (tags === void 0) { tags = []; }
        var fallbacks = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            fallbacks[_i - 2] = arguments[_i];
        }
        var unseen = this.selectUnseenTags.apply(this, __spreadArrays([seen, tags], fallbacks));
        return unseen.map(function (k) { return _this.get(k); }).filter(function (x) { return x !== null; });
    };
    ItemPool.prototype.selectRandomUnseen = function (seen, tags) {
        if (tags === void 0) { tags = []; }
        var fallbacks = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            fallbacks[_i - 2] = arguments[_i];
        }
        var unseen = this.selectUnseenTags.apply(this, __spreadArrays([seen, tags], fallbacks));
        var key = Random.fromArray(unseen);
        seen.push(key);
        return this.get(key);
    };
    ItemPool.prototype.getAll = function (tags) {
        var _this = this;
        if (tags === void 0) { tags = []; }
        if (this.sorted) {
            return this.keys.map(function (x) { return _this.items[x]; })
                .sort(function (a, b) { return a.sortingNumber - b.sortingNumber; })
                .filter(function (x) { return x.hasTags.apply(x, tags); })
                .map(function (x) { return x.get(); })
                .filter(function (x) { return x !== null; });
        }
        return this.keys.map(function (x) { return _this.get(x); }).filter(function (x) { return x !== null; });
    };
    return ItemPool;
}());
var tools = new ItemPool();
var ModifierTags;
(function (ModifierTags) {
})(ModifierTags || (ModifierTags = {}));
var modifiers = new ItemPool();
var CharacterTags;
(function (CharacterTags) {
    CharacterTags[CharacterTags["inFinalGame"] = 0] = "inFinalGame";
})(CharacterTags || (CharacterTags = {}));
var characters = new ItemPool(true);
var EnemyTags;
(function (EnemyTags) {
    EnemyTags[EnemyTags["goldfish"] = 0] = "goldfish";
    EnemyTags[EnemyTags["level1"] = 1] = "level1";
    EnemyTags[EnemyTags["level2"] = 2] = "level2";
    EnemyTags[EnemyTags["level3"] = 3] = "level3";
    EnemyTags[EnemyTags["boss"] = 4] = "boss";
})(EnemyTags || (EnemyTags = {}));
var enemies = new ItemPool();
var TraitTags;
(function (TraitTags) {
    TraitTags[TraitTags["standard"] = 0] = "standard";
    TraitTags[TraitTags["elite"] = 1] = "elite";
    TraitTags[TraitTags["curse"] = 2] = "curse";
    TraitTags[TraitTags["randomable"] = 3] = "randomable";
    TraitTags[TraitTags["coupdegracereward"] = 4] = "coupdegracereward";
})(TraitTags || (TraitTags = {}));
var traits = new ItemPool();
var FloorModifiers;
(function (FloorModifiers) {
    FloorModifiers[FloorModifiers["NO_EXIT"] = 0] = "NO_EXIT";
})(FloorModifiers || (FloorModifiers = {}));
var RoomEventPool = (function () {
    function RoomEventPool() {
    }
    return RoomEventPool;
}());
function enemyTagToLootMoney(tag) {
    switch (tag) {
        case EnemyTags.level1:
            return 1;
        case EnemyTags.level2:
            return 2;
        case EnemyTags.level3:
            return 3;
        case EnemyTags.boss:
            return 4;
        default:
            return 0;
    }
}
var EnemyEventPool = (function (_super) {
    __extends(EnemyEventPool, _super);
    function EnemyEventPool(min, max, tags) {
        var _this = _super.call(this) || this;
        _this.num = [min, max];
        _this.tags = tags;
        return _this;
    }
    EnemyEventPool.prototype.getEvents = function () {
        var num = Random.tupleInt(this.num);
        var result = [];
        for (var i = 0; i < num; i++) {
            var tag = Random.fromArray(this.tags);
            var enemy = Game.currentRun.nextEnemy([tag]);
            enemy.setLootMoney(enemyTagToLootMoney(tag));
            if (tag === EnemyTags.boss) {
                enemy.isFinalBoss = true;
            }
            var event_1 = new EnemyRoomEvent(enemy);
            if (tag === EnemyTags.goldfish) {
                event_1.roomIcon = RoomIcon.GOLDFISH;
            }
            else if (tag === EnemyTags.boss) {
                event_1.roomIcon = RoomIcon.BOSS;
            }
            result.push(event_1);
        }
        return result;
    };
    return EnemyEventPool;
}(RoomEventPool));
var TraitEventPool = (function (_super) {
    __extends(TraitEventPool, _super);
    function TraitEventPool(min, max, tags) {
        var _this = _super.call(this) || this;
        _this.num = [min, max];
        _this.tags = tags;
        return _this;
    }
    TraitEventPool.prototype.getEvents = function () {
        var _this = this;
        var traits = Arrays.generate(Random.tupleInt(this.num), function () { return Game.currentRun.nextTrait(_this.tags); });
        return traits.map(function (trait) { return new TraitRoomEvent(trait); });
    };
    return TraitEventPool;
}(RoomEventPool));
var ModifierEventPool = (function (_super) {
    __extends(ModifierEventPool, _super);
    function ModifierEventPool(min, max, tags) {
        var _this = _super.call(this) || this;
        _this.num = [min, max];
        _this.tags = tags;
        return _this;
    }
    ModifierEventPool.prototype.getEvents = function () {
        var _this = this;
        var mods = Arrays.generate(Random.tupleInt(this.num), function () { return Game.currentRun.nextModifier(_this.tags); });
        return mods.map(function (modifier) { return new ModifierRoomEvent(modifier); });
    };
    return ModifierEventPool;
}(RoomEventPool));
var EliteEnemyEventPool = (function (_super) {
    __extends(EliteEnemyEventPool, _super);
    function EliteEnemyEventPool(min, max, tags) {
        var _this = _super.call(this) || this;
        _this.num = [min, max];
        _this.tags = tags;
        return _this;
    }
    EliteEnemyEventPool.prototype.getEvents = function () {
        var num = Random.tupleInt(this.num);
        var result = [];
        for (var i = 0; i < num; i++) {
            var tag = Random.fromArray(this.tags);
            var enemy = Game.currentRun.nextEnemy([tag]);
            enemy.addLootTrait(Game.currentRun.nextTrait([TraitTags.elite]));
            enemy.setLootMoney(2 * enemyTagToLootMoney(tag));
            result.push(enemy);
        }
        return result.map(function (enemy) { return new EnemyRoomEvent(enemy); });
    };
    return EliteEnemyEventPool;
}(RoomEventPool));
var ShopEventPool = (function (_super) {
    __extends(ShopEventPool, _super);
    function ShopEventPool(min, max, modifierCounts, traitCounts) {
        var _this = _super.call(this) || this;
        _this.num = [min, max];
        _this.modifierCounts = modifierCounts;
        _this.traitCounts = traitCounts;
        return _this;
    }
    ShopEventPool.prototype.getEvents = function () {
        var _this = this;
        var shops = Arrays.generate(Random.tupleInt(this.num), function () { return new Shop(_this.modifierCounts, _this.traitCounts); });
        return shops.map(function (shop) { return new ShopRoomEvent(shop); });
    };
    return ShopEventPool;
}(RoomEventPool));
var CollectibleEventPool = (function (_super) {
    __extends(CollectibleEventPool, _super);
    function CollectibleEventPool(min, max, scripRewardRange) {
        var _this = _super.call(this) || this;
        _this.num = [min, max];
        _this.scripRewardRange = scripRewardRange;
        return _this;
    }
    CollectibleEventPool.prototype.getEvents = function () {
        var _this = this;
        return Arrays.generate(Random.tupleInt(this.num), function () { return new CollectibleRoomEvent(_this.scripRewardRange); });
    };
    return CollectibleEventPool;
}(RoomEventPool));
var FloorConfig = (function () {
    function FloorConfig(name, numRooms, song, eventPools) {
        var modifiers = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            modifiers[_i - 4] = arguments[_i];
        }
        this.name = name;
        this.song = song;
        this.numRooms = numRooms;
        this.eventPools = eventPools;
        this.modifiers = modifiers;
    }
    FloorConfig.prototype.getEvents = function () {
        return Arrays.flatten(this.eventPools.map(function (eventPool) { return eventPool.getEvents(); }));
    };
    FloorConfig.prototype.getNumRooms = function () {
        return Random.tupleInt(this.numRooms);
    };
    FloorConfig.prototype.getWidth = function () {
        return 5;
    };
    FloorConfig.prototype.getHeight = function () {
        return 5;
    };
    return FloorConfig;
}());
var floors = [
    new FloorConfig("The Foyer", [12, 15], MusicTracks.Foyer, [
        new EnemyEventPool(2, 4, [EnemyTags.level1]),
        new TraitEventPool(1, 2, [TraitTags.standard]),
        new ModifierEventPool(1, 2, []),
        new ShopEventPool(1, 1, [[null, 5]], [[TraitTags.elite, 2], [TraitTags.standard, 2], [TraitTags.curse, 1]]),
        new CollectibleEventPool(1, 1, [1, 3]),
    ]),
    new FloorConfig("The Lounge", [14, 17], MusicTracks.ProtoInh, [
        new EnemyEventPool(2, 4, [EnemyTags.level2]),
        new TraitEventPool(1, 2, [TraitTags.standard]),
        new ModifierEventPool(1, 2, []),
        new EliteEnemyEventPool(1, 1, [EnemyTags.level1]),
        new ShopEventPool(1, 1, [[null, 5]], [[TraitTags.elite, 2], [TraitTags.standard, 2], [TraitTags.curse, 1]]),
        new CollectibleEventPool(1, 1, [2, 5]),
    ]),
    new FloorConfig("The Library", [18, 20], MusicTracks.Foyer, [
        new EnemyEventPool(2, 4, [EnemyTags.level3]),
        new TraitEventPool(1, 2, [TraitTags.standard]),
        new ModifierEventPool(1, 2, []),
        new EliteEnemyEventPool(1, 1, [EnemyTags.level2]),
        new ShopEventPool(1, 1, [[null, 5]], [[TraitTags.elite, 2], [TraitTags.standard, 2], [TraitTags.curse, 1]]),
        new CollectibleEventPool(1, 1, [2, 5]),
    ]),
    new FloorConfig("The Attic", [4, 5], MusicTracks.MainTheme, [
        new EnemyEventPool(1, 1, [EnemyTags.boss]),
    ], FloorModifiers.NO_EXIT),
];
var Floor = (function () {
    function Floor(level, currentRun) {
        var _this = this;
        this.currentRun = currentRun;
        var floorSettings = floors[level];
        this.floorName = floorSettings.name;
        this.song = floorSettings.song;
        this.width = floorSettings.getWidth();
        this.height = floorSettings.getHeight();
        this.roomCount = floorSettings.getNumRooms();
        this.rooms = Arrays.generate(this.height, function () { return new Array(_this.width); });
        var entranceCoords = new Coordinates({
            x: Random.intLessThan(this.width),
            y: Random.intLessThan(this.height)
        });
        var entranceRoom = new Room(this, entranceCoords, new EmptyRoomEvent(RoomType.Entrance));
        this.entranceRoom = entranceRoom;
        this.rooms[entranceCoords.y][entranceCoords.x] = entranceRoom;
        var assignableRooms = [];
        var maxRoomDistance = 0;
        for (var i = 0; i < this.roomCount - 1; i++) {
            var roomCoords = void 0;
            var newRoomCoords = void 0;
            do {
                roomCoords = Random.intCoord(this.height, this.width);
                if (this.rooms[roomCoords.y][roomCoords.x] !== undefined) {
                    var dir = Random.fromNumericEnum(Direction);
                    var newRoomOffset = Directions.getOffset(dir);
                    newRoomCoords = roomCoords.applyOffset(newRoomOffset);
                }
            } while (!newRoomCoords || this.shouldGenNewRoom(newRoomCoords));
            var entrance = this.rooms[roomCoords.y][roomCoords.x];
            var newRoom = new Room(this, newRoomCoords, new EmptyRoomEvent(RoomType.Empty), entrance);
            this.rooms[newRoomCoords.y][newRoomCoords.x] = newRoom;
            this.rooms[roomCoords.y][roomCoords.x].exits.push(newRoom);
            assignableRooms.push(newRoom);
            maxRoomDistance = Math.max(maxRoomDistance, newRoom.distanceFromEntrance);
        }
        if (floorSettings.modifiers.indexOf(FloorModifiers.NO_EXIT) === -1) {
            var potentialExits = Arrays.flatten(this.rooms)
                .filter(function (room) { return !room.hasFurtherNeighbors(); })
                .sort(function (a, b) { return b.distanceFromEntrance - a.distanceFromEntrance; });
            var exitRoom_1 = potentialExits[0];
            exitRoom_1.roomEvent = new ExitRoomEvent();
            assignableRooms = assignableRooms.filter(function (room) { return room !== exitRoom_1; });
        }
        assignableRooms = Random.shuffle(assignableRooms);
        var events = floorSettings.getEvents();
        for (var i = 0; i < events.length && i < assignableRooms.length; i++) {
            assignableRooms[i].roomEvent = events[i];
        }
    }
    Floor.prototype.reveal = function () {
        this.rooms.forEach(function (arr) { return arr.forEach(function (room) {
            room.seen = true;
        }); });
        this.redraw();
    };
    Floor.prototype.draw = function () {
        this.div = UI.makeDiv('map');
        document.body.appendChild(this.div);
        this.redraw();
    };
    Floor.prototype.redraw = function () {
        UI.showMapScreen();
    };
    Floor.prototype.end = function () {
        document.body.removeChild(this.div);
    };
    Floor.prototype.getRoomAt = function (coords) {
        return this.rooms[coords.y] && this.rooms[coords.y][coords.x];
    };
    Floor.prototype.shouldGenNewRoom = function (coord) {
        if (!coord) {
            return false;
        }
        var x = coord.x;
        var y = coord.y;
        return x <= -1 || x >= this.width || y <= -1 || y >= this.height || this.rooms[y][x] !== undefined;
    };
    return Floor;
}());
var UI = (function () {
    function UI() {
    }
    UI.makeDiv = function (c, cList, id) {
        var div = document.createElement('div');
        if (c) {
            div.classList.add(c);
        }
        if (cList) {
            for (var i = 0; i < cList.length; i++) {
                div.classList.add(cList[i]);
            }
        }
        if (id) {
            div.id = id;
        }
        return div;
    };
    UI.makeElem = function (elem, str, c, id) {
        var e = document.createElement(elem);
        e.innerText = str;
        if (c) {
            e.classList.add(c);
        }
        if (id) {
            e.id = id;
        }
        return e;
    };
    UI.makePara = function (str, c, id) {
        return UI.makeElem('p', str, c, id);
    };
    UI.makeHeader = function (str, c, id, level) {
        if (level === void 0) { level = 1; }
        return UI.makeElem("h" + level, str, c, id);
    };
    UI.makeButton = function (str, func, disabled, c, id) {
        if (disabled === void 0) { disabled = false; }
        var b = document.createElement('button');
        b.type = 'button';
        b.disabled = disabled;
        b.innerText = str;
        if (c) {
            b.classList.add(c);
        }
        if (id) {
            b.id = id;
        }
        b.onclick = function (ev) {
            ev.preventDefault;
            func.call(this, ev);
        };
        return b;
    };
    UI.makeImg = function (src, c, id) {
        var img = document.createElement('img');
        img.src = src;
        if (c) {
            img.classList.add(c);
        }
        if (id) {
            img.id = id;
        }
        return img;
    };
    UI.makeRoomIcon = function (str) {
        return UI.makeImg("assets/" + str, 'room-icon');
    };
    UI.makeTooltip = function (name, desc) {
        var span = UI.makeElem('span', name, 'tooltip-container');
        var tooltip = UI.makeElem('span', desc, 'tooltip');
        span.appendChild(tooltip);
        return span;
    };
    UI.makeSlider = function (label, min, max, value, changeCallback) {
        var input = document.createElement('input');
        input.type = 'range';
        input.min = "" + min;
        input.max = "" + max;
        input.value = "" + value;
        input.onchange = function (ev) {
            changeCallback(this);
        };
        var para = UI.makePara(label + ": ");
        para.appendChild(input);
        return para;
    };
    UI.fakeClick = function (elem) {
        elem.classList.remove('fakeclick');
        elem.classList.add('fakeclick');
        window.setTimeout(function () {
            elem.onclick(new MouseEvent('click'));
            elem.classList.remove('fakeclick');
        }, 500);
    };
    UI.renderCombatantInfo = function (c) {
        var which;
        if (c instanceof Player) {
            which = 'player';
        }
        else {
            which = 'enemy';
        }
        var div = UI.makeDiv(which);
        if (c.imageSrc) {
            debugLog(c.imageSrc);
            div.appendChild(UI.makeImg(c.imageSrc, 'profile'));
        }
        var statuses = c.statuses.filter(function (status) { return status.isValid(); });
        for (var i = 0; i < statuses.length; i++) {
            div.classList.add("status-" + Strings.cssSanitize(c.statuses[i].getName()));
        }
        var namePara = UI.makePara(c.name, 'name');
        if (c.traits.length > 0) {
            namePara.appendChild(document.createTextNode(' ('));
            c.traits.forEach(function (tuple, i) {
                var nameString = tuple[0].name;
                if (tuple[1] > 1) {
                    nameString += Strings.power(tuple[1]);
                }
                namePara.appendChild(UI.makeTooltip(nameString, tuple[0].describe()));
                if (i < c.traits.length - 1) {
                    namePara.appendChild(document.createTextNode(', '));
                }
            });
            namePara.appendChild(document.createTextNode(')'));
        }
        div.appendChild(namePara);
        var statsDiv = UI.makeDiv('stats');
        statsDiv.appendChild(UI.makePara("Health: " + c.health + " / " + c.maxHealth, 'health'));
        statsDiv.appendChild(UI.makePara("Energy: " + c.energy + " / " + c.maxEnergy, 'energy'));
        if (c instanceof Player) {
            statsDiv.appendChild(UI.makePara("Scrip: " + c.currency));
        }
        div.appendChild(statsDiv);
        if (statuses.length > 0) {
            var statusPara = UI.makePara('');
            var statusSpans = statuses.map(function (status) {
                var name = status.amount + " " + Strings.capitalize(status.getName());
                var desc = (which == 'player') ? status.getDescriptionForPlayer() : status.getDescription();
                return UI.makeTooltip(name, desc);
            });
            for (var i = 0; i < statusSpans.length; i++) {
                statusPara.appendChild(statusSpans[i]);
                if (i !== statusSpans.length - 1) {
                    statusPara.appendChild(document.createTextNode(', '));
                }
            }
            div.appendChild(statusPara);
        }
        return div;
    };
    UI.renderCombatant = function (c, target, isTurn, buttonArr) {
        var div = UI.renderCombatantInfo(c);
        var toolDiv = document.createElement('div');
        toolDiv.classList.add('tools');
        for (var i = 0; i < c.tools.length; i++) {
            var currentDiv = UI.renderCombatTool(c.tools[i], c, i, target, isTurn, buttonArr);
            currentDiv.classList.add("tool_" + i);
            toolDiv.appendChild(currentDiv);
        }
        div.appendChild(toolDiv);
        return div;
    };
    UI.renderCombatantSidebar = function (c) {
        var div = UI.renderCombatantInfo(c);
        var toolDiv = document.createElement('div');
        toolDiv.classList.add('tools');
        for (var i = 0; i < c.tools.length; i++) {
            var currentDiv = UI.renderTool(c.tools[i]);
            currentDiv.classList.add("tool_" + i);
            toolDiv.appendChild(currentDiv);
        }
        div.appendChild(toolDiv);
        return div;
    };
    UI.renderTool = function (t) {
        var div = UI.makeDiv('tool');
        div.appendChild(UI.makePara(t.name, 'name'));
        div.appendChild(UI.makePara("Cost: " + t.cost.toString(), 'cost'));
        div.appendChild(UI.makePara(t.effectsString(), 'effect'));
        if (t.multiplier > 1) {
            div.appendChild(UI.makePara("x" + t.multiplier, 'multiplier'));
        }
        return div;
    };
    UI.renderCombatTool = function (t, c, i, target, isTurn, buttonArr) {
        var div = UI.renderTool(t);
        if (t.usesPerTurn < Infinity) {
            div.appendChild(UI.makePara("(" + t.usesLeftThisTurn + " use(s) left this turn)"));
        }
        if (t.usesPerFight < Infinity) {
            div.appendChild(UI.makePara("(" + t.usesLeftThisFight + " use(s) left this fight)"));
        }
        if (c && i !== undefined && target !== undefined) {
            var b = UI.makeButton('Use', function (e) {
                c.useTool(i, target);
                UI.redraw();
            }, !t.usableBy(c) || !isTurn, 'use');
            div.appendChild(b);
            if (buttonArr !== undefined) {
                buttonArr.push(b);
            }
        }
        return div;
    };
    UI.renderOfferTool = function (t, m, callback) {
        var div = UI.renderTool(t);
        if (t.usesPerTurn < Infinity) {
            div.appendChild(UI.makePara("usable " + t.usesPerTurn + " time(s) per turn"));
        }
        div.appendChild(UI.makeButton("Apply " + m.name, function (e) {
            SoundManager.playSoundEffect(SoundEffects.Modifier);
            m.apply(t);
            Game.currentRun.addStatistic(RunStatistics.MODIFIERS_TAKEN, 1);
            callback(true);
        }, false, 'apply'));
        return div;
    };
    UI.renderModifier = function (m, p, exitCallback, refusable) {
        if (refusable === void 0) { refusable = true; }
        var mainDiv = UI.makeDiv('offer');
        var div = UI.makeDiv('modifier');
        div.appendChild(UI.makePara(m.name, 'name'));
        div.appendChild(UI.makePara(m.describe(), 'desc'));
        var toolDiv = UI.makeDiv('tools');
        for (var i = 0; i < p.tools.length; i++) {
            toolDiv.appendChild(UI.renderOfferTool(p.tools[i], m, exitCallback));
        }
        div.appendChild(toolDiv);
        if (refusable) {
            div.appendChild(UI.makeButton('No Thank You', function () {
                exitCallback(false);
            }));
        }
        else {
            div.appendChild(UI.makeButton("Can't Refuse!", function () { }, true));
        }
        mainDiv.appendChild(div);
        return mainDiv;
    };
    UI.renderShopMenu = function (shop, player, exitCallback) {
        var _this = this;
        var div = UI.makeDiv("shop");
        div.appendChild(UI.makeHeader("Shop"));
        div.appendChild(UI.makePara("You have " + player.currency + " scrip."));
        var itemsPane = UI.makeDiv("shoplistscontainer");
        var modifiersPane = UI.makeDiv("shoplist");
        modifiersPane.appendChild(UI.makeHeader("Tool Modifiers"));
        shop.getModifierListings().forEach(function (listing) {
            var modifier = listing.modifier;
            var price = listing.price;
            var canAffordItem = (price <= player.currency);
            modifiersPane.appendChild(_this.renderShopModifierListing(modifier, price, canAffordItem, function () {
                if (canAffordItem) {
                    UI.fillScreen(UI.renderModifier(modifier, player, function (taken) {
                        if (taken) {
                            shop.sellModifier(listing, player);
                        }
                        UI.fillScreen(UI.renderShopMenu(shop, player, exitCallback));
                    }));
                }
            }));
        });
        itemsPane.appendChild(modifiersPane);
        var traitsPane = UI.makeDiv("shoplist");
        traitsPane.appendChild(UI.makeHeader("Character Traits"));
        shop.getTraitListings().forEach(function (listing) {
            var trait = listing.trait;
            var price = listing.price;
            var canAffordItem = (price <= player.currency);
            traitsPane.appendChild(_this.renderShopTraitListing(trait, price, canAffordItem, function () {
                shop.sellTrait(listing, player);
                UI.fillScreen(UI.renderShopMenu(shop, player, exitCallback));
            }));
        });
        itemsPane.appendChild(traitsPane);
        div.appendChild(itemsPane);
        div.appendChild(UI.makeButton("Exit shop", exitCallback));
        return div;
    };
    UI.renderShopModifierListing = function (modifier, price, enabled, purchaseCallback) {
        var div = UI.makeDiv("shopitem");
        div.appendChild(this.makePara(modifier.name));
        div.appendChild(this.makePara(modifier.describe()));
        div.appendChild(UI.makeButton("Purchase for " + price + " scrip", purchaseCallback, !enabled));
        return div;
    };
    UI.renderShopTraitListing = function (trait, price, enabled, purchaseCallback) {
        var div = UI.makeDiv("shopitem");
        div.appendChild(this.makePara(trait.name));
        div.appendChild(this.makePara(trait.describe()));
        div.appendChild(UI.makeButton("Purchase for " + price + " scrip", purchaseCallback, !enabled));
        return div;
    };
    UI.renderTrait = function (t, p, exitCallback, refusable) {
        if (refusable === void 0) { refusable = true; }
        var mainDiv = UI.makeDiv('offer');
        var div = UI.makeDiv('trait');
        div.appendChild(UI.makePara(t.name + " Potion", 'name'));
        div.appendChild(UI.makePara(t.describe(), 'desc'));
        div.appendChild(UI.makeButton('Drink', function () {
            SoundManager.playSoundEffect(SoundEffects.Trait);
            p.addTrait(t);
            Game.currentRun.addStatistic(RunStatistics.TRAITS_GAINED, 1);
            exitCallback(true);
        }));
        if (refusable) {
            div.appendChild(UI.makeButton('No Thank You', function () {
                exitCallback(false);
            }));
        }
        else {
            div.appendChild(UI.makeButton("Can't Refuse!", function () { }, true));
        }
        mainDiv.appendChild(div);
        return mainDiv;
    };
    UI.renderFloor = function (floor) {
        debugLog(floor);
        var div = UI.makeDiv("map");
        div.innerHTML = '';
        for (var i = 0; i < floor.height; i++) {
            var row = UI.makeDiv("map-row");
            for (var j = 0; j < floor.width; j++) {
                var currentRoom = floor.rooms[i][j];
                if (currentRoom) {
                    row.appendChild(UI.renderRoom(currentRoom));
                }
                else {
                    row.appendChild(UI.makeDiv("room", ["none"]));
                }
            }
            div.appendChild(row);
        }
        return div;
    };
    UI.renderRoom = function (room) {
        var div = UI.makeDiv("room");
        div.classList.add(room.getRoomType() + "-room");
        var playerCoords = Game.currentRun.playerCoordinates;
        var hasPlayer = room.coordinates.equals(playerCoords);
        var exitHasPlayer = room.exits.some(function (e) { return e.coordinates.equals(playerCoords); });
        if (room.seen || room.visited) {
            div.classList.add("visible");
            if (hasPlayer) {
                div.appendChild(UI.makeRoomIcon(Game.currentRun.player.floorIcon));
            }
            else if (room.getIcon() !== RoomIcon.NONE) {
                div.appendChild(UI.makeRoomIcon(room.getIcon()));
            }
        }
        if (exitHasPlayer) {
            div.onclick = function (e) {
                room.enter();
            };
        }
        if (room.visited) {
            div.classList.add("visited");
        }
        else {
            div.classList.add("unvisited");
        }
        var boxShadowAttributes = ['-moz-box-shadow', '-webkit-box-shadow', 'box-shadow'];
        var shadows = room.getBlockedDirections().map(function (d) { return UI.directionToBoxShadow(d, 4, 'black'); }).join(', ');
        for (var _i = 0, boxShadowAttributes_1 = boxShadowAttributes; _i < boxShadowAttributes_1.length; _i++) {
            var attr = boxShadowAttributes_1[_i];
            div.style[attr] = shadows;
        }
        var cornerDiv = UI.makeDiv("room-corners");
        div.appendChild(cornerDiv);
        return div;
    };
    UI.directionToBoxShadow = function (dir, width, color) {
        switch (dir) {
            case Direction.Right:
                return "inset -" + width + "px 0px 0px 0px " + color;
            case Direction.Up:
                return "inset 0px " + width + "px 0px 0px " + color;
            case Direction.Left:
                return "inset " + width + "px 0px 0px 0px " + color;
            case Direction.Down:
                return "inset 0px -" + width + "px 0px 0px " + color;
        }
    };
    UI.handleKeyDown = function (e) {
        var dir = Directions.fromKey(e.key);
        if (dir !== undefined && Game.currentRun && UI.isOnMapScreen()) {
            e.preventDefault();
            Game.currentRun.shiftPlayer(dir);
        }
    };
    UI.renderMainTitle = function () {
        return UI.makeImg('assets/final_logo.png', 'logo');
    };
    UI.renderTitleScreen = function (options) {
        var div = UI.makeDiv('titlescreen');
        div.appendChild(UI.renderMainTitle());
        div.appendChild(UI.renderOptions(options));
        return div;
    };
    UI.renderGameView = function (floor, player) {
        var div = UI.makeDiv();
        var container = UI.makeDiv('game');
        container.appendChild(UI.renderFloor(floor));
        container.appendChild(UI.renderCombatantSidebar(player));
        var menuButton = UI.makeButton('Main Menu', function () { return Game.showTitle(); }, false, 'main-menu');
        container.appendChild(menuButton);
        div.append(container);
        var journalHTML = UI.renderJournal(function () { return Game.resumeRun(); }, NotePool.getUnlockedNotes());
        var journalButton = UI.makeButton("Journal", function () { return UI.fillScreen(journalHTML); }, false, 'gamejournalbutton');
        div.appendChild(journalButton);
        return div;
    };
    UI.renderOptions = function (options) {
        var buttons = UI.makeDiv('buttons');
        for (var i = 0; i < options.length; i++) {
            buttons.appendChild(UI.makeButton(options[i][0], options[i][1]));
        }
        return buttons;
    };
    UI.renderCreditsEntry = function (entry) {
        var div = UI.makeDiv('entry');
        if (entry.roles.length > 0) {
            div.appendChild(UI.makeHeader(entry.name, 'name', undefined, 2));
            div.appendChild(UI.makePara(entry.roles.join(', '), 'roles'));
        }
        else {
            div.appendChild(UI.makePara(entry.name, 'sololine'));
        }
        return div;
    };
    UI.renderCredits = function (credits, endfunc) {
        var div = UI.makeDiv('credits');
        div.appendChild(UI.renderMainTitle());
        credits.map(function (x) { return UI.renderCreditsEntry(x); }).forEach(function (val) {
            div.appendChild(val);
        });
        if (endfunc) {
            div.appendChild(UI.makeButton('Return to Title', endfunc));
        }
        return div;
    };
    UI.renderJournal = function (exit, unlockedNotes) {
        var div = UI.makeDiv('journal');
        div.appendChild(UI.makeHeader('Unlocked Files'));
        function noteDisplayFunction(note) {
            UI.fillScreen(UI.renderNote(function () { return UI.fillScreen(div); }, note));
        }
        var noteTuples = unlockedNotes.map(function (note) { return [note.title, function () { return noteDisplayFunction(note); }]; });
        div.appendChild(UI.renderOptions(noteTuples.concat([['Close Journal', exit]])));
        return div;
    };
    UI.renderNote = function (exit, note) {
        var div = UI.makeDiv('note');
        div.appendChild(UI.makeHeader(note.title, 'notetitle'));
        var noteBodyContainer = UI.makeDiv('notebodycontainer');
        var paragraphs = note.content.split("\n");
        paragraphs.forEach(function (paragraph) { return noteBodyContainer.appendChild(UI.renderNoteParagraph(paragraph)); });
        div.appendChild(noteBodyContainer);
        div.appendChild(UI.makeButton("Close", exit));
        return div;
    };
    UI.renderNoteParagraph = function (text) {
        var p = UI.makePara('', 'notebody');
        var split = text.split(/[{}]/g);
        split.map(function (str, i) {
            switch (i % 2) {
                case 0:
                    return document.createTextNode(str);
                case 1:
                    return UI.makeElem('span', str, 'blur');
            }
        }).forEach(function (elem) { return p.appendChild(elem); });
        return p;
    };
    UI.renderScripReward = function (exit, reward) {
        var div = UI.makeDiv('note');
        div.appendChild(UI.makeHeader("You found " + reward + " scrip!"));
        div.appendChild(UI.makeButton("Continue", exit));
        return div;
    };
    UI.renderSettings = function (exit) {
        var div = UI.makeDiv('settings');
        div.appendChild(UI.makeHeader('Settings'));
        var volume = Settings.getVolumePercent();
        div.appendChild(UI.makeSlider('Volume', 0, 100, volume, function (t) {
            Settings.setVolumePercent(parseInt(t.value));
            SoundManager.playSoundEffect(SoundEffects.Noise);
            Save.saveSettings();
        }));
        div.appendChild(UI.makeButton("Reset Game", function () {
            UI.fillScreen(UI.renderResetConfirm(function () { return UI.fillScreen(UI.renderSettings(exit)); }));
        }));
        div.appendChild(UI.makeButton('Back', exit));
        return div;
    };
    UI.renderResetConfirm = function (cancelExitCallback) {
        var div = UI.makeDiv('settings');
        div.appendChild(UI.makeHeader('Are you sure you want to reset the game?'));
        div.appendChild(UI.makePara("All progress will be lost, and settings will be restored to defaults."));
        div.appendChild(UI.makeButton('Cancel', cancelExitCallback));
        div.appendChild(UI.makeButton('Reset Game', function () { return Game.resetGame(); }));
        return div;
    };
    UI.renderCharacterSelect = function (callback, exit) {
        var chars = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            chars[_i - 2] = arguments[_i];
        }
        var div = UI.makeDiv('charselect');
        var charHeader = UI.makeHeader('Choose Your Character');
        div.appendChild(charHeader);
        var charDiv = UI.makeDiv('characters');
        chars.forEach(function (char) { return charDiv.appendChild(UI.renderCharacterObject(callback, char)); });
        charDiv.appendChild(UI.renderCharacter('assets/random.png', 'Random', function () { return callback(Random.fromArray(chars)); }));
        div.appendChild(charDiv);
        div.appendChild(UI.makeButton('Back to Title', exit));
        return div;
    };
    UI.renderCharacterObject = function (callback, character) {
        var filename = character.imageSrc || 'assets/The_Reject_-_Done.png';
        return UI.renderCharacter(filename, character.name, function () { return callback(character); });
    };
    UI.renderCharacter = function (filename, name, callback) {
        var div = UI.makeDiv('character');
        div.appendChild(UI.makeElem('h2', name));
        var img = UI.makeImg(filename, 'profile');
        img.alt = name;
        img.onclick = function () { return callback(); };
        div.appendChild(img);
        return div;
    };
    UI.renderRun = function (run) {
        var div = UI.makeDiv('run-stats');
        var descs = Object.keys(RunStatistics).map(function (stat) { return run.statisticString(RunStatistics[stat]); }).filter(function (x) { return !!x; });
        descs.forEach(function (desc) { return div.appendChild(UI.makePara(desc)); });
        return div;
    };
    UI.setRedrawFunction = function (f) {
        UI.redrawFunction = f;
    };
    UI.redraw = function () {
        if (UI.redrawFunction) {
            UI.redrawFunction();
        }
    };
    UI.fillScreen = function () {
        var elems = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elems[_i] = arguments[_i];
        }
        UI.onMapScreen = false;
        var gameview = document.getElementById('gameview');
        gameview.innerHTML = '';
        elems.forEach(function (elem) { return gameview.appendChild(elem); });
    };
    UI.showMapScreen = function () {
        UI.fillScreen(UI.renderGameView(Game.currentRun.currentFloor, Game.currentRun.player));
        UI.onMapScreen = true;
    };
    UI.isOnMapScreen = function () {
        return UI.onMapScreen;
    };
    UI.announce = function (text) {
        var h1 = UI.makeHeader('', 'announcement');
        var spans = text.split('').map(function (letter) { return UI.makeElem('span', letter); });
        var delay = 500;
        spans.forEach(function (span, index) {
            h1.appendChild(span);
            window.setTimeout(function () {
                span.classList.add('letter');
            }, index * delay);
        });
        document.body.appendChild(h1);
        window.setTimeout(function () {
            document.body.removeChild(h1);
        }, delay * spans.length + 4000);
    };
    return UI;
}());
var Fight = (function () {
    function Fight(p, e, inRoom) {
        var _this = this;
        Game.currentRun.addStatistic(RunStatistics.ENEMIES_FOUGHT, 1);
        this.player = p;
        this.enemy = e;
        p.startFight(e);
        e.startFight(p);
        if (inRoom) {
            this.inRoom = inRoom;
        }
        this.endCallback = function () { };
        this.playersTurn = true;
        this.readyToEnd = false;
        this.enemyButtons = [];
        UI.setRedrawFunction(function () { _this.redraw(); });
        this.enemy.setDeathFunc(function () { _this.enemyDied(); });
        this.player.setAfterToolFunc(function () { _this.checkEnd(); });
        this.enemy.setAfterToolFunc(function () { _this.checkEnd(); });
        this.div = document.createElement('div');
        this.player.startTurn();
        this.draw();
    }
    Fight.prototype.setEndCallback = function (f) {
        this.endCallback = f;
    };
    Fight.prototype.endTurn = function () {
        if (this.playersTurn) {
            this.player.endTurn();
            this.enemy.startTurn();
        }
        else {
            this.enemy.endTurn();
            this.player.startTurn();
        }
        if (this.checkEnd()) {
            return;
        }
        this.playersTurn = !this.playersTurn;
        this.enemyButtons = [];
        UI.redraw();
        if (!this.playersTurn) {
            var enemyMoveSequence = AI.bestMoveSequence(this.enemy, this.player, 2000);
            this.makeNextEnemyMove(enemyMoveSequence);
        }
    };
    Fight.prototype.makeNextEnemyMove = function (moveSequence) {
        var _this = this;
        debugLog(moveSequence);
        if (moveSequence.length <= 0) {
            UI.fakeClick(this.enemyButtons[this.enemyButtons.length - 1]);
            return;
        }
        else {
            var move = moveSequence.shift();
            if (move !== undefined) {
                debugLog("Move: " + move);
                UI.fakeClick(this.enemyButtons[move]);
                window.setTimeout(function () {
                    _this.makeNextEnemyMove(moveSequence);
                }, 750);
            }
        }
    };
    Fight.prototype.endTurnButton = function () {
        var _this = this;
        return UI.makeButton('End Turn', function () { _this.endTurn(); }, !this.playersTurn, 'endturn');
    };
    Fight.prototype.draw = function () {
        this.div = UI.makeDiv('arena');
        UI.fillScreen(this.div);
        this.redraw();
    };
    Fight.prototype.redraw = function () {
        this.div.innerHTML = '';
        this.div.appendChild(UI.renderCombatant(this.player, this.enemy, this.playersTurn));
        this.div.appendChild(UI.renderCombatant(this.enemy, this.player, false, this.enemyButtons));
        var etb = this.endTurnButton();
        this.div.appendChild(etb);
        this.enemyButtons.push(etb);
    };
    Fight.prototype.enemyDied = function () {
        this.readyToEnd = true;
        this.player.giveCurrency(this.enemy.lootMoney);
    };
    Fight.prototype.checkEnd = function () {
        if (this.readyToEnd) {
            this.end();
            return true;
        }
        return false;
    };
    Fight.prototype.end = function () {
        this.player.endFight();
        this.enemy.endFight();
        if (this.enemy.isFinalBoss) {
            Game.showVictory(Game.currentRun);
        }
        else {
            if (this.inRoom) {
                this.inRoom.continueFloor();
            }
            else {
                this.endCallback();
            }
        }
    };
    return Fight;
}());
var Game = (function () {
    function Game() {
    }
    Game.showTitle = function () {
        var options;
        SoundManager.playSong(MusicTracks.MainTheme);
        if (Game.currentRun) {
            options = [
                ['New Game', function () { return Game.showCharSelect(); }],
                ['Resume Play', function () { return Game.resumeRun(); }],
                ['Settings', function () { return Game.showSettings(); }],
                ['Journal', function () { return Game.showJournal(); }],
                ['Credits', function () { return Game.showCredits(); }],
            ];
        }
        else {
            options = [
                ['New Game', function () { return Game.showCharSelect(); }],
                ['Settings', function () { return Game.showSettings(); }],
                ['Journal', function () { return Game.showJournal(); }],
                ['Credits', function () { return Game.showCredits(); }],
            ];
        }
        UI.fillScreen(UI.renderTitleScreen(options));
    };
    Game.showCharSelect = function () {
        var charas = characters.getAll([CharacterTags.inFinalGame]);
        UI.fillScreen(UI.renderCharacterSelect.apply(UI, __spreadArrays([Game.newRun, Game.showTitle], charas)));
        debugLog(characters.getAll());
    };
    Game.newRun = function (character) {
        var charNote = NotePool.unlockCharacterNote(character);
        if (charNote) {
            UI.fillScreen(UI.renderNote((function () { return Game.newRun(character); }), charNote));
            return;
        }
        var tutorialNote = NotePool.getNoteByTitle("Tutorial");
        if (!tutorialNote.unlocked) {
            tutorialNote.unlocked = true;
            UI.fillScreen(UI.renderNote((function () { return Game.newRun(character); }), tutorialNote));
            Save.saveNotes();
            return;
        }
        Game.currentRun = new Run(character);
        Game.currentRun.start();
    };
    Game.resumeRun = function () {
        UI.showMapScreen();
    };
    Game.resetGame = function () {
        Save.clearLocalStorage();
        window.location.reload();
    };
    Game.showCredits = function () {
        UI.fillScreen(UI.renderCredits([
            new CreditsEntry('May Lawver', 'Team Lead', 'Design', 'Programming', 'Writing'),
            new CreditsEntry('Grace Rarer', 'Programming', 'Design'),
            new CreditsEntry('Pranay Rapolu', 'Music'),
            new CreditsEntry('Prindle', 'Programming'),
            new CreditsEntry('Mitchell Philipp', 'Programming'),
            new CreditsEntry('Prince Bull', 'Art'),
            new CreditsEntry('Seong Ryoo', 'Art', 'Music'),
            new CreditsEntry('Finn Schiesser', 'Logo'),
        ], function () { return Game.showTitle(); }));
    };
    Game.showSettings = function (inGame) {
        if (inGame === void 0) { inGame = false; }
        UI.fillScreen(UI.renderSettings(Game.showTitle));
    };
    Game.showJournal = function () {
        UI.fillScreen(UI.renderJournal(function () { return Game.showTitle(); }, NotePool.getUnlockedNotes()));
    };
    Game.showGameOver = function (run) {
        this.currentRun = undefined;
        UI.fillScreen(UI.makeHeader('Game Over'), UI.renderRun(run), UI.renderOptions([
            ['Back to Title Screen', function () { return Game.showTitle(); }]
        ]));
    };
    Game.showVictory = function (run) {
        this.currentRun = undefined;
        UI.fillScreen(UI.makeHeader('Victory!'), UI.renderRun(run), UI.renderOptions([
            ['Back to Title Screen', function () { return Game.showTitle(); }]
        ]));
    };
    return Game;
}());
var Note = (function () {
    function Note(title, content, id, unlocked, character) {
        this.title = title;
        this.content = content;
        this.id = id;
        this.unlocked = unlocked;
        this.character = character;
    }
    ;
    return Note;
}());
var NotePool = (function () {
    function NotePool() {
    }
    NotePool.loadNote = function (title, content) {
        var newNote = new Note(title, content, NotePool.notes.length, false);
        NotePool.notes.push(newNote);
    };
    NotePool.loadCharacterNote = function (title, content, characterName) {
        var newNote = new Note(title, content, NotePool.notes.length, false, characterName);
        NotePool.notes.push(newNote);
    };
    NotePool.reloadAllNotes = function () {
        NotePool.notes = [];
        NoteResources.loadAllNoteResources();
    };
    NotePool.getUnlockedNotes = function () {
        return NotePool.notes.filter(function (element) { return (element.unlocked); });
    };
    NotePool.unlockNewNote = function () {
        var lockedNotes = NotePool.notes.filter(function (element) { return (element.unlocked == false); }).filter(function (element) { return (element.character == undefined); });
        if (lockedNotes.length == 0) {
            return null;
        }
        else {
            var next = Random.fromArray(lockedNotes);
            next.unlocked = true;
            Save.saveNotes();
            return next;
        }
    };
    NotePool.getUnlockedNoteIDs = function () {
        var ids = [];
        NotePool.getUnlockedNotes().forEach(function (element) {
            ids.push(element.id);
        });
        return ids;
    };
    NotePool.setUnlockedNotes = function (unlockedIDs) {
        NotePool.notes.forEach(function (note) {
            var currentID = note.id;
            if (unlockedIDs.indexOf(currentID) > -1) {
                note.unlocked = true;
            }
            else {
                note.unlocked = false;
            }
        });
        Save.saveNotes();
    };
    NotePool.unlockSpecificNote = function (title) {
        NotePool.notes.filter(function (note) { return (note.title == title); }).forEach(function (note) {
            note.unlocked = true;
        });
        Save.saveNotes();
    };
    NotePool.getNoteByTitle = function (title) {
        var matchingNotes = NotePool.notes.filter(function (note) { return (note.title == title); });
        if (matchingNotes.length > 0) {
            return matchingNotes[0];
        }
        return null;
    };
    NotePool.unlockCharacterNote = function (playerCharacter) {
        var characterNotes = NotePool.notes.filter(function (element) { return (element.character == playerCharacter.name); }).filter(function (element) { return (!element.unlocked); });
        if (characterNotes.length == 0) {
            return null;
        }
        characterNotes.forEach(function (note) {
            note.unlocked = true;
        });
        Save.saveNotes();
        return characterNotes[0];
    };
    NotePool.notes = [];
    return NotePool;
}());
var NoteResources;
(function (NoteResources) {
    function loadAllNoteResources() {
        NotePool.loadNote("Tutorial", "You have three main resources: Health, Energy, and Scrip.\nHealth is reduced when you get attacked, and you lose if it hits zero.\nMost tools require Energy. It gets replenished each turn.\nScrip is the currency of this world. It can be spent at shops.\nUse arrow keys or click adjacent rooms to move around the map.\nYou will encounter many foes in your journey. Moving to the same space as them will start a fight. Use your tools in battle to defeat them.\nIn battles you might get Statuses. Mouse over them to see what they do.\nBottles on the map contain Traits. Unlike Statuses, these stick with you. Some traits are bad... use your best judgement!\nStrange machines contain Modifiers that you can use to improve your equipment. Be careful - some of them have tradeoffs!\nStaircases on the map take you to the next floor.\nGet to the last floor and defeat the boss to win.\nGood luck!\n");
        NotePool.loadNote("Old Leather-Bound Notebook", "June 16, 192{X} - I have been commissioned to construct a new clock tower for the city. This is an exciting opportunity. The tower itself I shall outsource to a local construction company. The clock that will live within the tower is my main focus. The ongoing maintenance of a clock is surely one of the most difficult things for a city to do. My plan, then, is to create an intelligent clock that can self-maintain, lasting 100 years without requiring human intervention. I shall call it Century.\nSeptember 5, 192{X} - The bureaucrats at City Hall have sent me many missives asking when the empty tower will be filled. Those fools should know not to rush genius.\nNovember 1, 192{X} - The city has stolen my construction contract and has given it to another. This betrayal will not go unrepaid... I shall move into the empty clock tower and make it my home, as revenge against the city that spited me.");
        NotePool.loadNote("Medical Robotics Progress", "October 3, 197{X} - To show the world the many applications of automatons, I have begun designing a medical robot that can administer medications and assist with medical procedures.\n- - -\nNovember 20, 197{X} - The first prototype of the robotic medic is operational, autonomously dispensing medicines. It would be even more useful if it could assist with surgeries, but existing surgical tools require human-shaped hands. This may be a perfect application for my research into Surgical Lasers.\n- - -\nDecember 29, 197{X} - Equipping the medical robots with powerful lasers makes them potentially dangerous as weapons. I\'ve had to program them with a \"digital hippocratic oath\" to ensure that they never harm their patients.\n---\nJune 6, 198{Y} - I\'ve started developing a more capable successor to the robotic medic. I intend for this new machine to perform complex surgeries without human intervention, which will require a much more advanced computational circuit than the earlier models. Ideally, I should also try to find a way to integrate the \"hippocratic oath\" into this new model, but this may be more difficult because of its increased autonomy.\n");
        NotePool.loadNote("Obituary", "    Dr. {Alexander} {Loremipsum}, famed roboticist, has passed away. Known by most for contributing the robot Mr. Pillbug for the long-running TV series Dexter Spacer\'s Grand Adventures, his thesis paper on hydraulic mathematics is regarded by many as a promising \"road not taken\" for the field of computing.\n    He is survived by his granddaughter.");
        NotePool.loadCharacterNote("Headlines", "{Manchester} Family Manor Burgled - Strange Claw Marks Found On Upholstery!\n\nPriceless Curtains Shredded, Millions Lost In Art Show Heist!\n\nFort Knox Empty Save For Stray Ball of Yarn!\n\nCatnip Prices Soar After Massive Crop Theft!", "The Catburglar");
        NotePool.loadCharacterNote("Project S2 Experiment Log", "October 29, 195{T} - My previous experiments with cloning have been less than successful. However, new studies I have undertaken indicate that this attempt may be successful. I still have no ethical samples, so I must use myself as a test subject once more.\nOctober 30, 195{T} - Preliminary results are promising. This clone will require time to grow, and I regret that tomorrow\'s festivities will prevent me from taking detailed notes on his progress.\nNovember 1, 195{T} - The clone\'s progress remains promising.\nDecember 14, 195{T} - Success! He is finally grown enough to be removed from the cloning apparatus. I must confess to a swell of pride upon seeing him - he even resembles the photographs Mother showed me of myself when I was young. I will instruct him in the matters of science at once.", "The Clone");
        NotePool.loadCharacterNote("A Letter In The Mail", "September 29, 198{E}\nDear Ms. {Loremipsum},\n    I regret to inform you that your grandfather, Dr. {Loremipsum}, has passed away. As I am sure you are already aware, he named you his sole beneficiary.\n    While it is not a condition of you receiving your inheritance, he requested that you visit his tower at some point in the coming months.\n    You have my deepest condolences and sympathies in what I am sure is an incredibly trying time. If you require assistance arranging funerary matters, I would be honored to provde it.\n    Yours,\n    Mr. {Dolorsit}\n    Executor of Dr. {Loremipsum}\'s Estate", "The Granddaughter");
        NotePool.loadCharacterNote("Project S1 Experiment Log", "January 14, 195{X} - In my career as a scientist, nothing has excited me more than the discovery of the \"double helix\" and its fascinating code. I will not join those who wax rhapsodic about life\'s sublime beauty. My goal instead is to duplicate existing species as a stepping stone to fathering a new one.\nFebruary 8, 195{X} - My experiments with duplication of life are progressing encouragingly enough. I have managed to grow lilies, pitcher plants, and Venus flytraps from artificially synthesized seeds. I believe I will be able to replicate mammals soon enough.\nMarch 20, 195{X} - The lillies are growing quite nicely. The difficulty in ethically sourcing animals to experiment upon provides an intolerable delay in the next stage of my plans. Progressing to human cloning is an exercise in hubris, but my grasp of the theory is so strong I doubt there is much chance of any adverse results.\nMarch 21, 195{X} - My clone. He melted.", "The Reject");
        NotePool.loadCharacterNote("Unfiled Documents", "March 12, 195{X} - A television studio requested I create an animatronic actor for them. Though it is beneath me, I can have the requested mechanical man done within the week and can use the leftover funds to continue my other experiments.\n- - -\nNovember 5, 196{Y} - The program I built a robot for has been canceled. The executives had the good graces to return said robot to me. I must find some way to repurpose it - I am loathe to let my handiwork go to waste...\n- - -\nJune 10, 197{L} - Recent research into the functions of the brain has me curious. Would it be possible to move a consciousness from a living brain to a human brain? I am advancing in age and soon reaching the point where such outlandish schemes seem reasonable.\n- - -\nAugust 29, 198{E} - My research is stagnant. I need more time.", "The Shell");
        NotePool.loadNote("Reconfigurable Architecture", "February 197{I}\n\nI\'ve designed a marvelous way to improve the efficacy of the tower. By rigging each room with a combination of electric motors, hydraulics, and digital control circuitry, I could make it so that the entire floor plan can be rearranged on command. Why walk up and down so many stairs when I could summon any one of the tower\'s workshops, laboratories, or storerooms and have it move into place?\n\nIn the short term, I estimate that renovating the tower to be self-reconfiguring will provide a {16}-percent increase in my productivity. In the long term, in the event that my experiments in life extension and rejuvenation take more than a few decades to bear fruit, not having to walk up and down the stairs of the tower will help me stay productive as I grow older.");
    }
    NoteResources.loadAllNoteResources = loadAllNoteResources;
})(NoteResources || (NoteResources = {}));
var RunStatistics;
(function (RunStatistics) {
    RunStatistics[RunStatistics["DAMAGE_TAKEN"] = 0] = "DAMAGE_TAKEN";
    RunStatistics[RunStatistics["DAMAGE_DEALT"] = 1] = "DAMAGE_DEALT";
    RunStatistics[RunStatistics["MODIFIERS_TAKEN"] = 2] = "MODIFIERS_TAKEN";
    RunStatistics[RunStatistics["TRAITS_GAINED"] = 3] = "TRAITS_GAINED";
    RunStatistics[RunStatistics["SCRIP_EARNED"] = 4] = "SCRIP_EARNED";
    RunStatistics[RunStatistics["ENEMIES_FOUGHT"] = 5] = "ENEMIES_FOUGHT";
    RunStatistics[RunStatistics["SCRIP_SPENT"] = 6] = "SCRIP_SPENT";
})(RunStatistics || (RunStatistics = {}));
var Run = (function () {
    function Run(player) {
        var _this = this;
        this.player = player;
        player.specialDamageFunction = function (x) { return _this.addStatistic(RunStatistics.DAMAGE_TAKEN, x); };
        this.player.setDeathFunc(function () { return Game.showGameOver(_this); });
        this.playerCoordinates = new Coordinates({ x: 0, y: 0 });
        this.floorNumber = 0;
        this.seenEnemies = [];
        this.seenModifiers = [];
        this.seenTraits = [];
        this.statistics = [0, 0, 0, 0, 0, 0, 0];
    }
    Run.prototype.start = function () {
        this.nextFloor();
    };
    Run.prototype.addStatistic = function (statistic, change) {
        this.statistics[statistic] += change;
    };
    Run.prototype.statisticString = function (statistic) {
        var amount = this.statistics[statistic];
        switch (statistic) {
            case RunStatistics.DAMAGE_DEALT:
                return "You dealt " + amount + " damage.";
            case RunStatistics.DAMAGE_TAKEN:
                return "You took " + amount + " damage.";
            case RunStatistics.ENEMIES_FOUGHT:
                return "You fought " + amount + " enemies.";
            case RunStatistics.MODIFIERS_TAKEN:
                return "You took " + amount + " modifiers.";
            case RunStatistics.TRAITS_GAINED:
                return "You gained " + amount + " traits.";
            case RunStatistics.SCRIP_EARNED:
                return "You gathered " + amount + " scrip.";
            case RunStatistics.SCRIP_SPENT:
                return "You spent " + amount + " scrip.";
        }
    };
    Run.prototype.nextFloor = function () {
        if (this.floorNumber >= floors.length) {
            this.floorNumber %= floors.length;
        }
        this.currentFloor = new Floor(this.floorNumber, this);
        this.playerCoordinates = this.currentFloor.entranceRoom.coordinates;
        this.currentFloor.redraw();
        UI.announce(this.currentFloor.floorName);
        SoundManager.playSong(this.currentFloor.song);
        this.currentFloor.entranceRoom.enter();
        this.floorNumber++;
    };
    Run.prototype.nextModifier = function () {
        var tagSets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tagSets[_i] = arguments[_i];
        }
        return modifiers.selectRandomUnseen.apply(modifiers, __spreadArrays([this.seenModifiers], tagSets));
    };
    Run.prototype.nextEnemy = function () {
        var tagSets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tagSets[_i] = arguments[_i];
        }
        return enemies.selectRandomUnseen.apply(enemies, __spreadArrays([this.seenEnemies], tagSets));
    };
    Run.prototype.nextTrait = function () {
        var tagSets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tagSets[_i] = arguments[_i];
        }
        return traits.selectRandomUnseen.apply(traits, __spreadArrays([this.seenTraits], tagSets));
    };
    Run.prototype.movePlayer = function (coords) {
        this.playerCoordinates = coords;
    };
    Run.prototype.shiftPlayer = function (dir) {
        if (!this.playerCoordinates || !this.currentFloor) {
            return;
        }
        var currentRoom = this.currentFloor.getRoomAt(this.playerCoordinates);
        if (!currentRoom || currentRoom.getBlockedDirections().indexOf(dir) > -1) {
            return;
        }
        var offset = Directions.getOffset(dir);
        var coord = this.playerCoordinates.applyOffset(offset);
        var room = this.currentFloor.getRoomAt(coord);
        if (room) {
            room.enter();
        }
    };
    return Run;
}());
var Save = (function () {
    function Save() {
    }
    Save.saveNotes = function () {
        if (Save.isSupported) {
            var noteIDs = NotePool.getUnlockedNoteIDs();
            var json = JSON.stringify(noteIDs);
            window.localStorage.setItem(Save.lsNoteKey, json);
            return true;
        }
        return false;
    };
    Save.loadNotes = function () {
        if (Save.isSupported) {
            try {
                var contents = window.localStorage.getItem(Save.lsNoteKey);
                if (contents === null) {
                    return true;
                }
                var noteIDs = JSON.parse(contents);
                var isArray = Array.isArray(noteIDs) && noteIDs.every(function (x) { return typeof x === "number"; });
                if (isArray) {
                    NotePool.setUnlockedNotes(noteIDs);
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    return false;
                }
                else {
                    throw e;
                }
            }
        }
        return false;
    };
    Save.saveSettings = function () {
        if (Save.isSupported) {
            var obj = Settings.dumpToObject();
            var json = JSON.stringify(obj);
            window.localStorage.setItem(Save.lsSettingsKey, json);
            return true;
        }
        return false;
    };
    Save.loadSettings = function () {
        if (Save.isSupported) {
            try {
                var contents = window.localStorage.getItem(Save.lsSettingsKey);
                if (contents === null) {
                    return true;
                }
                var obj = JSON.parse(contents);
                if (isSettingsOptions(obj)) {
                    Settings.loadFromObject(obj);
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    return false;
                }
                else {
                    throw e;
                }
            }
        }
        return false;
    };
    Save.clearLocalStorage = function () {
        if (this.isSupported) {
            window.localStorage.clear();
        }
    };
    Save.isSupported = window.localStorage !== undefined && window.localStorage !== null;
    Save.lsNoteKey = 'unlocked_notes';
    Save.lsSettingsKey = 'settings';
    return Save;
}());
function isSettingsOptions(x) {
    if (typeof (x) === "object" && x !== null) {
        var y = x;
        return y.volumePercent !== undefined;
    }
    else {
        return false;
    }
}
var Settings = (function () {
    function Settings() {
    }
    Settings.getVolumePercent = function () {
        return Settings.options.volumePercent;
    };
    Settings.setVolumePercent = function (percent) {
        Settings.options.volumePercent = percent;
        SoundManager.setVolume(percent / 100);
    };
    Settings.loadFromObject = function (obj) {
        Settings.options = __assign({}, obj);
    };
    Settings.dumpToObject = function () {
        return __assign({}, Settings.options);
    };
    Settings.options = {
        volumePercent: 100
    };
    return Settings;
}());
var Shop = (function () {
    function Shop(modifierCounts, traitCounts) {
        var _this = this;
        this.modifiersForSale = [];
        modifierCounts.forEach(function (tuple) {
            var tag = tuple[0];
            var count = tuple[1];
            var price = Shop.calculateModifierPrice(tag);
            if (tag) {
                var newModifiers = Arrays.generate(count, function () { return (new ShopModifierListing(Game.currentRun.nextModifier([tag]), price)); });
                newModifiers.forEach(function (listing) { return _this.modifiersForSale.push(listing); });
            }
            else {
                var newModifiers = Arrays.generate(count, function () { return (new ShopModifierListing(Game.currentRun.nextModifier(), price)); });
                newModifiers.forEach(function (listing) { return _this.modifiersForSale.push(listing); });
            }
        });
        this.traitsForSale = [];
        traitCounts.forEach(function (tuple) {
            var tag = tuple[0];
            var count = tuple[1];
            var price = Shop.calculateTraitPrice(tag);
            if (tag !== null && tag !== undefined) {
                var newTraits = Arrays.generate(count, function () { return (new ShopTraitListing(Game.currentRun.nextTrait([tag]), price)); });
                newTraits.forEach(function (listing) { return _this.traitsForSale.push(listing); });
            }
            else {
                var newTraits = Arrays.generate(count, function () { return (new ShopTraitListing(Game.currentRun.nextTrait(), price)); });
                newTraits.forEach(function (listing) { return _this.traitsForSale.push(listing); });
            }
        });
    }
    Shop.prototype.getModifierListings = function () {
        return this.modifiersForSale;
    };
    Shop.prototype.getTraitListings = function () {
        return this.traitsForSale;
    };
    Shop.prototype.sellModifier = function (listing, player) {
        debugLog("Tried to sell" + listing.modifier.name);
        if (listing.price <= player.currency) {
            if (this.modifiersForSale.indexOf(listing) != -1) {
                this.modifiersForSale.splice(this.modifiersForSale.indexOf(listing), 1);
                player.payCurrency(listing.price);
            }
        }
    };
    Shop.prototype.sellTrait = function (listing, player) {
        debugLog("Tried to sell" + listing.trait.name);
        if (listing.price <= player.currency) {
            if (this.traitsForSale.indexOf(listing) != -1) {
                this.traitsForSale.splice(this.traitsForSale.indexOf(listing), 1);
                player.addTrait(listing.trait);
                player.payCurrency(listing.price);
                Game.currentRun.addStatistic(RunStatistics.TRAITS_GAINED, 1);
            }
        }
    };
    Shop.calculateModifierPrice = function (tag) {
        return 3;
    };
    Shop.calculateTraitPrice = function (tag) {
        if (tag === TraitTags.elite) {
            return 5;
        }
        else if (tag === TraitTags.standard) {
            return 2;
        }
        else if (tag === TraitTags.curse) {
            return 0;
        }
    };
    return Shop;
}());
var ShopModifierListing = (function () {
    function ShopModifierListing(modifier, price) {
        this.modifier = modifier;
        this.price = price;
    }
    return ShopModifierListing;
}());
var ShopTraitListing = (function () {
    function ShopTraitListing(trait, price) {
        this.trait = trait;
        this.price = price;
    }
    return ShopTraitListing;
}());
var DEBUG = false;
var debug = function (f) {
    if (DEBUG) {
        f();
    }
};
var debugLog = function () {
    var a = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        a[_i] = arguments[_i];
    }
    if (DEBUG) {
        console.log(a);
    }
};
var ondebug = function (target, propertyKey, descr) {
    var original = descr.value;
    descr.value = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (DEBUG) {
            original(args);
        }
    };
};
var override = function (superclass) {
    return function (proto, fields, descr) { };
};
var BackfireEffect = (function (_super) {
    __extends(BackfireEffect, _super);
    function BackfireEffect(damage) {
        var _this = _super.call(this) || this;
        _this.damage = damage;
        return _this;
    }
    BackfireEffect.prototype.effect = function (user, target) {
        user.wound(this.damage);
    };
    BackfireEffect.prototype.toString = function () {
        return "take " + this.damage + " damage";
    };
    BackfireEffect.prototype.clone = function () {
        return new BackfireEffect(this.damage);
    };
    return BackfireEffect;
}(AbstractEffect));
var ChanceEffect = (function (_super) {
    __extends(ChanceEffect, _super);
    function ChanceEffect(chance, next, otherwise) {
        var _this = _super.call(this) || this;
        _this.chance = chance;
        _this.next = next;
        _this.otherwise = otherwise;
        return _this;
    }
    ChanceEffect.prototype.effect = function (user, foe) {
        if (Random.bool(this.chance)) {
            this.next.effect(user, foe);
        }
        else if (this.otherwise) {
            this.otherwise.effect(user, foe);
        }
    };
    ChanceEffect.prototype.toString = function () {
        var chance = (this.chance * 100).toFixed(0);
        if (this.otherwise) {
            var otherChance = (100 - this.chance * 100).toFixed(0);
            return chance + "% chance to " + this.next.toString() + "; " + otherChance + "% chance to " + this.otherwise.toString() + " instead";
        }
        else {
            return chance + "% chance to " + this.next.toString();
        }
    };
    ChanceEffect.prototype.clone = function () {
        return new ChanceEffect(this.chance, this.next.clone(), this.otherwise ? this.otherwise.clone() : undefined);
    };
    return ChanceEffect;
}(AbstractEffect));
var ChangeUserNegativeStatuses = (function (_super) {
    __extends(ChangeUserNegativeStatuses, _super);
    function ChangeUserNegativeStatuses(amount) {
        var _this = _super.call(this) || this;
        _this.amount = amount;
        return _this;
    }
    ChangeUserNegativeStatuses.prototype.effect = function (user, target) {
        var _this = this;
        var badStatuses = user.statuses.filter(function (status) { return status.getUtility() < 0; }).map(function (status) { return status.clone(); });
        badStatuses.forEach(function (status) {
            status.amount = _this.amount;
            user.addStatus(status);
        });
    };
    ChangeUserNegativeStatuses.prototype.toString = function () {
        if (this.amount < 0) {
            return "decrease all your negative statuses by " + Math.abs(this.amount);
        }
        else {
            return "increase all your negative statuses by " + this.amount;
        }
    };
    ChangeUserNegativeStatuses.prototype.clone = function () {
        return new ChangeUserNegativeStatuses(this.amount);
    };
    return ChangeUserNegativeStatuses;
}(AbstractEffect));
var CombinationEffect = (function (_super) {
    __extends(CombinationEffect, _super);
    function CombinationEffect() {
        var effects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            effects[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.effects = effects;
        return _this;
    }
    CombinationEffect.prototype.effect = function (user, foe) {
        for (var i = 0; i < this.effects.length; i++) {
            this.effects[i].activate(user, foe);
        }
    };
    CombinationEffect.prototype.toString = function () {
        var acc = [];
        for (var i = 0; i < this.effects.length; i++) {
            acc.push(this.effects[i].toString());
        }
        return acc.join(' and ');
    };
    CombinationEffect.prototype.clone = function () {
        return new (CombinationEffect.bind.apply(CombinationEffect, __spreadArrays([void 0], this.effects.map(function (x) { return x.clone(); }))))();
    };
    return CombinationEffect;
}(AbstractEffect));
var CounterEffect = (function (_super) {
    __extends(CounterEffect, _super);
    function CounterEffect(next, count) {
        var _this = _super.call(this) || this;
        _this.next = next;
        _this.maxCounter = count;
        _this.currentCounter = count;
        return _this;
    }
    CounterEffect.prototype.effect = function (user, foe) {
        this.currentCounter--;
        if (this.currentCounter <= 0) {
            this.next.activate(user, foe);
            this.currentCounter = this.maxCounter;
        }
    };
    CounterEffect.prototype.toString = function () {
        if (this.currentCounter === 1) {
            return "next use, " + this.next.toString();
        }
        else {
            return "in " + this.currentCounter + " uses, " + this.next.toString();
        }
    };
    CounterEffect.prototype.clone = function () {
        return new CounterEffect(this.next.clone(), this.maxCounter);
    };
    return CounterEffect;
}(AbstractEffect));
var CycleEffect = (function (_super) {
    __extends(CycleEffect, _super);
    function CycleEffect() {
        var effects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            effects[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.effects = effects;
        _this.index = 0;
        return _this;
    }
    CycleEffect.prototype.effect = function (user, target) {
        this.effects[this.index].effect(user, target);
        this.index = (this.index + 1) % this.effects.length;
    };
    CycleEffect.prototype.clone = function () {
        var clone = new (CycleEffect.bind.apply(CycleEffect, __spreadArrays([void 0], this.effects.map(function (x) { return x.clone(); }))))();
        clone.index = this.index;
        return clone;
    };
    CycleEffect.prototype.toString = function () {
        return this.effects[this.index].toString() + ". Cycle effects";
    };
    return CycleEffect;
}(AbstractEffect));
var DamageEffect = (function (_super) {
    __extends(DamageEffect, _super);
    function DamageEffect(damage) {
        var _this = _super.call(this) || this;
        _this.damage = damage;
        return _this;
    }
    DamageEffect.prototype.effect = function (user, target) {
        var oldHealth = target.health;
        target.wound(user.statusFold(StatusFolds.DAMAGE_DEALT, this.damage));
        if (user instanceof Player) {
            Game.currentRun.addStatistic(RunStatistics.DAMAGE_DEALT, oldHealth - target.health);
        }
    };
    DamageEffect.prototype.toString = function () {
        return "do " + this.damage + " damage";
    };
    DamageEffect.prototype.clone = function () {
        return new DamageEffect(this.damage);
    };
    return DamageEffect;
}(AbstractEffect));
var GainEnergyEffect = (function (_super) {
    __extends(GainEnergyEffect, _super);
    function GainEnergyEffect(amount) {
        var _this = _super.call(this) || this;
        _this.amount = amount;
        return _this;
    }
    GainEnergyEffect.prototype.effect = function (user, target) {
        user.gainEnergy(this.amount);
    };
    GainEnergyEffect.prototype.toString = function () {
        return "gain " + this.amount + " energy";
    };
    GainEnergyEffect.prototype.clone = function () {
        return new GainEnergyEffect(this.amount);
    };
    return GainEnergyEffect;
}(AbstractEffect));
var GiveOtherRandomTraitEffect = (function (_super) {
    __extends(GiveOtherRandomTraitEffect, _super);
    function GiveOtherRandomTraitEffect() {
        return _super.call(this) || this;
    }
    GiveOtherRandomTraitEffect.prototype.effect = function (user, target) {
        var trait = traits.selectRandomUnseen([], [TraitTags.randomable]);
        target.addTrait(trait);
        trait.startFight(target);
    };
    GiveOtherRandomTraitEffect.prototype.toString = function () {
        return "give your opponent a random trait";
    };
    GiveOtherRandomTraitEffect.prototype.clone = function () {
        return new GiveOtherRandomTraitEffect();
    };
    return GiveOtherRandomTraitEffect;
}(AbstractEffect));
var GiveOtherStatusEffect = (function (_super) {
    __extends(GiveOtherStatusEffect, _super);
    function GiveOtherStatusEffect(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        return _this;
    }
    GiveOtherStatusEffect.prototype.effect = function (user, target) {
        target.addStatus(this.status.clone());
    };
    GiveOtherStatusEffect.prototype.toString = function () {
        return "give opponent " + this.status.amount + " " + Strings.capitalize(this.status.getName());
    };
    GiveOtherStatusEffect.prototype.clone = function () {
        return new GiveOtherStatusEffect(this.status.clone());
    };
    return GiveOtherStatusEffect;
}(AbstractEffect));
var GiveOtherTraitEffect = (function (_super) {
    __extends(GiveOtherTraitEffect, _super);
    function GiveOtherTraitEffect(trait) {
        var _this = _super.call(this) || this;
        _this.trait = trait;
        if (trait == null) {
            debugLog("Null trait in trait effect");
        }
        return _this;
    }
    GiveOtherTraitEffect.prototype.effect = function (user, foe) {
        var foeTrait = this.trait.clone();
        foe.addTrait(foeTrait);
        foeTrait.startFight(foe);
    };
    GiveOtherTraitEffect.prototype.toString = function () {
        return "give your opponent the " + this.trait.name + " trait";
    };
    GiveOtherTraitEffect.prototype.clone = function () {
        return new GiveOtherTraitEffect(this.trait.clone());
    };
    return GiveOtherTraitEffect;
}(AbstractEffect));
var GiveSelfRandomTraitEffect = (function (_super) {
    __extends(GiveSelfRandomTraitEffect, _super);
    function GiveSelfRandomTraitEffect() {
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        if (tags.length === 0) {
            tags = [TraitTags.randomable];
        }
        _this.tags = tags;
        return _this;
    }
    GiveSelfRandomTraitEffect.prototype.effect = function (user, target) {
        var trait = traits.selectRandomUnseen([], this.tags);
        user.addTrait(trait);
        trait.startFight(user);
    };
    GiveSelfRandomTraitEffect.prototype.toString = function () {
        if (this.tags.indexOf(TraitTags.coupdegracereward) !== -1) {
            return "gain Cunning";
        }
        else {
            return "gain a random trait";
        }
    };
    GiveSelfRandomTraitEffect.prototype.clone = function () {
        return new (GiveSelfRandomTraitEffect.bind.apply(GiveSelfRandomTraitEffect, __spreadArrays([void 0], this.tags)))();
    };
    return GiveSelfRandomTraitEffect;
}(AbstractEffect));
var GiveSelfStatusEffect = (function (_super) {
    __extends(GiveSelfStatusEffect, _super);
    function GiveSelfStatusEffect(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        return _this;
    }
    GiveSelfStatusEffect.prototype.effect = function (user, target) {
        user.addStatus(this.status.clone());
    };
    GiveSelfStatusEffect.prototype.toString = function () {
        if (this.status.amount < 0) {
            return "lose " + Math.abs(this.status.amount) + " " + Strings.capitalize(this.status.getName());
        }
        return "gain " + this.status.amount + " " + Strings.capitalize(this.status.getName());
    };
    GiveSelfStatusEffect.prototype.clone = function () {
        return new GiveSelfStatusEffect(this.status.clone());
    };
    return GiveSelfStatusEffect;
}(AbstractEffect));
var HalveMaxHealthEffect = (function (_super) {
    __extends(HalveMaxHealthEffect, _super);
    function HalveMaxHealthEffect() {
        return _super.call(this) || this;
    }
    HalveMaxHealthEffect.prototype.effect = function (user, target) {
        user.decreaseMaxHealth(Math.floor(user.maxHealth / 2));
    };
    HalveMaxHealthEffect.prototype.toString = function () {
        return "halve your maximum health";
    };
    HalveMaxHealthEffect.prototype.clone = function () {
        return new HalveMaxHealthEffect();
    };
    return HalveMaxHealthEffect;
}(AbstractEffect));
var HealingEffect = (function (_super) {
    __extends(HealingEffect, _super);
    function HealingEffect(amount) {
        var _this = _super.call(this) || this;
        _this.amount = amount;
        return _this;
    }
    HealingEffect.prototype.effect = function (user, target) {
        if (this.amount === -1) {
            user.heal(user.maxHealth);
        }
        else {
            user.heal(this.amount);
        }
    };
    HealingEffect.prototype.toString = function () {
        if (this.amount === -1) {
            return "recover all health";
        }
        return "recover " + this.amount + " health";
    };
    HealingEffect.prototype.clone = function () {
        return new HealingEffect(this.amount);
    };
    return HealingEffect;
}(AbstractEffect));
var InstantKillEffect = (function (_super) {
    __extends(InstantKillEffect, _super);
    function InstantKillEffect() {
        return _super.call(this) || this;
    }
    InstantKillEffect.prototype.effect = function (user, target) {
        target.actuallyDie();
    };
    InstantKillEffect.prototype.toString = function () {
        return "kill your opponent";
    };
    InstantKillEffect.prototype.clone = function () {
        return new InstantKillEffect();
    };
    return InstantKillEffect;
}(AbstractEffect));
var LeechEffect = (function (_super) {
    __extends(LeechEffect, _super);
    function LeechEffect(damage) {
        var _this = _super.call(this) || this;
        _this.damage = damage;
        return _this;
    }
    LeechEffect.prototype.effect = function (user, target) {
        var oldHealth = target.health;
        target.wound(user.statusFold(StatusFolds.DAMAGE_DEALT, this.damage));
        var healAmount = oldHealth - target.health;
        user.heal(healAmount);
        if (user instanceof Player) {
            Game.currentRun.addStatistic(RunStatistics.DAMAGE_DEALT, healAmount);
        }
    };
    LeechEffect.prototype.toString = function () {
        return "do " + this.damage + " damage and heal equal to damage dealt";
    };
    LeechEffect.prototype.clone = function () {
        return new LeechEffect(this.damage);
    };
    return LeechEffect;
}(AbstractEffect));
var LoseAllTraitsEffect = (function (_super) {
    __extends(LoseAllTraitsEffect, _super);
    function LoseAllTraitsEffect() {
        return _super.call(this) || this;
    }
    LoseAllTraitsEffect.prototype.effect = function (user, target) {
        var traits = user.traits.length;
        for (var i = 0; i < traits; i++) {
            user.removeTrait(0);
        }
    };
    LoseAllTraitsEffect.prototype.toString = function () {
        return "lose all traits";
    };
    LoseAllTraitsEffect.prototype.clone = function () {
        return new LoseAllTraitsEffect();
    };
    return LoseAllTraitsEffect;
}(AbstractEffect));
var LoseEnergyEffect = (function (_super) {
    __extends(LoseEnergyEffect, _super);
    function LoseEnergyEffect(amount) {
        var _this = _super.call(this) || this;
        _this.amount = amount;
        return _this;
    }
    LoseEnergyEffect.prototype.effect = function (user, target) {
        user.loseEnergy(this.amount);
    };
    LoseEnergyEffect.prototype.toString = function () {
        return "lose " + this.amount + " energy";
    };
    LoseEnergyEffect.prototype.clone = function () {
        return new LoseEnergyEffect(this.amount);
    };
    return LoseEnergyEffect;
}(AbstractEffect));
var NonlethalDamageEffect = (function (_super) {
    __extends(NonlethalDamageEffect, _super);
    function NonlethalDamageEffect(damage) {
        var _this = _super.call(this) || this;
        _this.damage = damage;
        return _this;
    }
    NonlethalDamageEffect.prototype.effect = function (user, target) {
        var oldHealth = target.health;
        var clone = target.clone();
        clone.wound(user.statusFold(StatusFolds.DAMAGE_DEALT, this.damage));
        if (clone.health > 0) {
            target.wound(user.statusFold(StatusFolds.DAMAGE_DEALT, this.damage));
        }
        else {
            target.directDamage(target.health - 1);
        }
        if (user instanceof Player) {
            Game.currentRun.addStatistic(RunStatistics.DAMAGE_DEALT, oldHealth - target.health);
        }
    };
    NonlethalDamageEffect.prototype.toString = function () {
        return "do up to " + this.damage + " nonlethal damage";
    };
    NonlethalDamageEffect.prototype.clone = function () {
        return new NonlethalDamageEffect(this.damage);
    };
    return NonlethalDamageEffect;
}(AbstractEffect));
var NothingEffect = (function (_super) {
    __extends(NothingEffect, _super);
    function NothingEffect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NothingEffect.prototype.effect = function (user, foe) {
        return;
    };
    NothingEffect.prototype.toString = function () {
        return 'do nothing';
    };
    NothingEffect.prototype.clone = function () {
        return new NothingEffect();
    };
    return NothingEffect;
}(AbstractEffect));
var OwnStatusTriggeredEffect = (function (_super) {
    __extends(OwnStatusTriggeredEffect, _super);
    function OwnStatusTriggeredEffect(status, next) {
        var _this = _super.call(this) || this;
        _this.status = status;
        _this.next = next;
        return _this;
    }
    OwnStatusTriggeredEffect.prototype.effect = function (user, target) {
        var repeat = user.getStatusAmount(this.status);
        for (var i = 0; i < repeat; i++) {
            this.next.effect(user, target);
        }
    };
    OwnStatusTriggeredEffect.prototype.toString = function () {
        return this.next.toString() + " for each " + Strings.capitalize(this.status.getName()) + " you have";
    };
    OwnStatusTriggeredEffect.prototype.clone = function () {
        return new OwnStatusTriggeredEffect(this.status.clone(), this.next.clone());
    };
    return OwnStatusTriggeredEffect;
}(AbstractEffect));
var PayWithRandomTraitEffect = (function (_super) {
    __extends(PayWithRandomTraitEffect, _super);
    function PayWithRandomTraitEffect(next) {
        var _this = _super.call(this) || this;
        _this.next = next;
        return _this;
    }
    PayWithRandomTraitEffect.prototype.effect = function (user, target) {
        if (user.traits.length === 0) {
            return;
        }
        var index = Random.intLessThan(user.traits.length);
        user.removeTrait(index);
        this.next.effect(user, target);
    };
    PayWithRandomTraitEffect.prototype.toString = function () {
        return "lose a random trait to " + this.next.toString();
    };
    PayWithRandomTraitEffect.prototype.clone = function () {
        return new PayWithRandomTraitEffect(this.next.clone());
    };
    return PayWithRandomTraitEffect;
}(AbstractEffect));
var PredicateEffect = (function (_super) {
    __extends(PredicateEffect, _super);
    function PredicateEffect(predicate, next, otherwise) {
        var _this = _super.call(this) || this;
        _this.predicate = predicate;
        _this.next = next;
        _this.otherwise = otherwise;
        return _this;
    }
    PredicateEffect.prototype.effect = function (user, foe) {
        if (this.predicate.evaluate(user, foe)) {
            this.next.effect(user, foe);
        }
        else if (this.otherwise) {
            this.otherwise.effect(user, foe);
        }
    };
    PredicateEffect.prototype.toString = function () {
        if (this.otherwise != undefined) {
            return "if " + this.predicate + ", " + this.next + ", otherwise " + this.otherwise;
        }
        else {
            return "if " + this.predicate + ", " + this.next;
        }
    };
    PredicateEffect.prototype.clone = function () {
        return new PredicateEffect(this.predicate.clone(), this.next.clone(), (this.otherwise) ? this.otherwise.clone() : undefined);
    };
    return PredicateEffect;
}(AbstractEffect));
var RemoveSelfStatusEffect = (function (_super) {
    __extends(RemoveSelfStatusEffect, _super);
    function RemoveSelfStatusEffect(status) {
        var _this = _super.call(this) || this;
        _this.status = status;
        return _this;
    }
    RemoveSelfStatusEffect.prototype.effect = function (user, target) {
        user.removeStatus(this.status.clone());
    };
    RemoveSelfStatusEffect.prototype.toString = function () {
        return "lose all " + Strings.capitalize(this.status.getName());
    };
    RemoveSelfStatusEffect.prototype.clone = function () {
        return new RemoveSelfStatusEffect(this.status.clone());
    };
    return RemoveSelfStatusEffect;
}(AbstractEffect));
var RepeatingEffect = (function (_super) {
    __extends(RepeatingEffect, _super);
    function RepeatingEffect(next, times) {
        var _this = _super.call(this) || this;
        _this.next = next;
        _this.times = times;
        return _this;
    }
    RepeatingEffect.prototype.effect = function (user, foe) {
        for (var i = 0; i < this.times; i++) {
            this.next.activate(user, foe);
        }
    };
    RepeatingEffect.prototype.toString = function () {
        return this.next.toString() + " " + this.times + " times";
    };
    RepeatingEffect.prototype.clone = function () {
        return new RepeatingEffect(this.next.clone(), this.times);
    };
    return RepeatingEffect;
}(AbstractEffect));
var TraitTriggeredEffect = (function (_super) {
    __extends(TraitTriggeredEffect, _super);
    function TraitTriggeredEffect(next) {
        var _this = _super.call(this) || this;
        _this.next = next;
        return _this;
    }
    TraitTriggeredEffect.prototype.effect = function (user, target) {
        var repeat = user.traits.length;
        for (var i = 0; i < repeat; i++) {
            this.next.effect(user, target);
        }
    };
    TraitTriggeredEffect.prototype.toString = function () {
        return this.next.toString() + " for every trait you have";
    };
    TraitTriggeredEffect.prototype.clone = function () {
        return new TraitTriggeredEffect(this.next.clone());
    };
    return TraitTriggeredEffect;
}(AbstractEffect));
var AngryStatus = (function (_super) {
    __extends(AngryStatus, _super);
    function AngryStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    AngryStatus.prototype.endTurn = function (affected, other) {
        this.amount--;
    };
    AngryStatus.prototype.overridenUtilityFunction = function (bot, human) {
        return AiUtilityFunctions.aggressiveUtility(bot, human);
    };
    AngryStatus.prototype.add = function (other) {
        if (other instanceof AngryStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    AngryStatus.prototype.sameKind = function (other) {
        return other instanceof AngryStatus;
    };
    AngryStatus.prototype.clone = function () {
        return new AngryStatus(this.amount);
    };
    AngryStatus.prototype.getName = function () {
        return 'angry';
    };
    AngryStatus.prototype.getDescription = function () {
        return 'Prefers aggression. Decreases by one each turn.';
    };
    AngryStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    AngryStatus.prototype.getUtility = function () {
        return -1 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "overridenUtilityFunction", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], AngryStatus.prototype, "getUtility", null);
    return AngryStatus;
}(AbstractStatus));
var BatteryStatus = (function (_super) {
    __extends(BatteryStatus, _super);
    function BatteryStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    BatteryStatus.prototype.add = function (other) {
        if (other instanceof BatteryStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    BatteryStatus.prototype.runsOut = function (affected, other) {
        affected.actuallyDie();
    };
    BatteryStatus.prototype.endTurn = function (affected, other) {
        this.amount--;
    };
    BatteryStatus.prototype.sameKind = function (other) {
        return other instanceof BatteryStatus;
    };
    BatteryStatus.prototype.clone = function () {
        return new BatteryStatus(this.amount);
    };
    BatteryStatus.prototype.getName = function () {
        return 'battery';
    };
    BatteryStatus.prototype.getDescription = function () {
        return "If this hits zero, die instantly. Decrements by one each turn.";
    };
    BatteryStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    BatteryStatus.prototype.getUtility = function () {
        return this.amount * 10;
    };
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "runsOut", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], BatteryStatus.prototype, "getUtility", null);
    return BatteryStatus;
}(AbstractStatus));
var BurnStatus = (function (_super) {
    __extends(BurnStatus, _super);
    function BurnStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    BurnStatus.prototype.useTool = function (affected, other) {
        affected.wound(this.amount);
    };
    BurnStatus.prototype.endTurn = function (affected, other) {
        this.amount = 0;
    };
    BurnStatus.prototype.add = function (other) {
        if (other instanceof BurnStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    BurnStatus.prototype.sameKind = function (other) {
        return other instanceof BurnStatus;
    };
    BurnStatus.prototype.clone = function () {
        return new BurnStatus(this.amount);
    };
    BurnStatus.prototype.getName = function () {
        return 'burn';
    };
    BurnStatus.prototype.getDescription = function () {
        return "Take " + this.amount + " damage whenever you use a tool this turn.";
    };
    BurnStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    BurnStatus.prototype.getUtility = function () {
        return -5 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "useTool", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], BurnStatus.prototype, "getUtility", null);
    return BurnStatus;
}(AbstractStatus));
var ConfusionStatus = (function (_super) {
    __extends(ConfusionStatus, _super);
    function ConfusionStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    ConfusionStatus.prototype.endTurn = function (affected, other) {
        this.amount--;
    };
    ConfusionStatus.prototype.overridenUtilityFunction = function (bot, human) {
        return AiUtilityFunctions.blindUtility(bot, human);
    };
    ConfusionStatus.prototype.add = function (other) {
        if (other instanceof ConfusionStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    ConfusionStatus.prototype.sameKind = function (other) {
        return other instanceof ConfusionStatus;
    };
    ConfusionStatus.prototype.clone = function () {
        return new ConfusionStatus(this.amount);
    };
    ConfusionStatus.prototype.getName = function () {
        return 'confused';
    };
    ConfusionStatus.prototype.getDescription = function () {
        return 'Make random moves instead of thinking strategically.';
    };
    ConfusionStatus.prototype.getDescriptionForPlayer = function () {
        return 'Become unable to see tool descriptions';
    };
    ConfusionStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    ConfusionStatus.prototype.getUtility = function () {
        return -5 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "overridenUtilityFunction", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "getDescriptionForPlayer", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], ConfusionStatus.prototype, "getUtility", null);
    return ConfusionStatus;
}(AbstractStatus));
var CountDownStatus = (function (_super) {
    __extends(CountDownStatus, _super);
    function CountDownStatus(amount, damage) {
        var _this = _super.call(this, amount, StatusValidators.POSITIVE) || this;
        _this.damage = damage;
        return _this;
    }
    CountDownStatus.prototype.add = function (other) {
        if (other instanceof CountDownStatus) {
            this.amount += other.amount;
            this.damage += other.damage;
            return true;
        }
        return false;
    };
    CountDownStatus.prototype.runsOut = function (user, target) {
        target.wound(this.damage);
        if (target.health > 0) {
            user.actuallyDie();
        }
    };
    CountDownStatus.prototype.endTurn = function (affected, other) {
        this.amount--;
    };
    CountDownStatus.prototype.sameKind = function (other) {
        return other instanceof CountDownStatus;
    };
    CountDownStatus.prototype.clone = function () {
        return new CountDownStatus(this.amount, this.damage);
    };
    CountDownStatus.prototype.getName = function () {
        return 'countdown';
    };
    CountDownStatus.prototype.getDescription = function () {
        return "If this hits zero, self-destruct and deal " + this.damage + " damage";
    };
    CountDownStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    CountDownStatus.prototype.getUtility = function () {
        return 100 - this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "runsOut", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], CountDownStatus.prototype, "getUtility", null);
    return CountDownStatus;
}(AbstractStatus));
var FlowStatus = (function (_super) {
    __extends(FlowStatus, _super);
    function FlowStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    FlowStatus.prototype.takeDamage = function (affected, other) {
        this.amount--;
    };
    FlowStatus.prototype.add = function (other) {
        if (other instanceof FlowStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    FlowStatus.prototype.sameKind = function (other) {
        return other instanceof FlowStatus;
    };
    FlowStatus.prototype.clone = function () {
        return new FlowStatus(this.amount);
    };
    FlowStatus.prototype.getName = function () {
        return 'flow';
    };
    FlowStatus.prototype.getDescription = function () {
        return "Used for combos. Decreases whenever you take damage.";
    };
    FlowStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    FlowStatus.prototype.getUtility = function () {
        return this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "takeDamage", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], FlowStatus.prototype, "getUtility", null);
    return FlowStatus;
}(AbstractStatus));
var DecoyStatus = (function (_super) {
    __extends(DecoyStatus, _super);
    function DecoyStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    DecoyStatus.prototype.takeDamage = function (affected, other) {
        affected.addStatus(new FlowStatus(this.amount));
    };
    DecoyStatus.prototype.startTurn = function (affected, other) {
        this.amount = 0;
    };
    DecoyStatus.prototype.add = function (other) {
        if (other instanceof DecoyStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    DecoyStatus.prototype.sameKind = function (other) {
        return other instanceof DecoyStatus;
    };
    DecoyStatus.prototype.clone = function () {
        return new DecoyStatus(this.amount);
    };
    DecoyStatus.prototype.getName = function () {
        return 'decoy';
    };
    DecoyStatus.prototype.damageTakenFold = function (acc, affected) {
        this.amount--;
        affected.addStatus(new FlowStatus(1));
        return 0;
    };
    DecoyStatus.prototype.getDescription = function () {
        if (this.amount === 1) {
            return 'Block the next attack this turn. Gain Flow when attacked.';
        }
        return "Block the next " + this.amount + " attacks this turn. Gain Flow when attacked.";
    };
    DecoyStatus.prototype.getSortingNumber = function () {
        return -20;
    };
    DecoyStatus.prototype.getUtility = function () {
        return this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "takeDamage", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "startTurn", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "damageTakenFold", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], DecoyStatus.prototype, "getUtility", null);
    return DecoyStatus;
}(AbstractStatus));
var DefenseStatus = (function (_super) {
    __extends(DefenseStatus, _super);
    function DefenseStatus(amount) {
        return _super.call(this, amount, StatusValidators.NONZERO) || this;
    }
    DefenseStatus.prototype.damageTakenFold = function (acc, affected) {
        return Math.max(0, acc - this.amount);
    };
    DefenseStatus.prototype.add = function (other) {
        if (other instanceof DefenseStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    DefenseStatus.prototype.sameKind = function (other) {
        return other instanceof DefenseStatus;
    };
    DefenseStatus.prototype.clone = function () {
        return new DefenseStatus(this.amount);
    };
    DefenseStatus.prototype.getName = function () {
        return 'defense';
    };
    DefenseStatus.prototype.getDescription = function () {
        if (this.amount > 0) {
            return "Take " + this.amount + " less damage from attacks.";
        }
        else {
            return "Take " + Math.abs(this.amount) + " more damage from attacks.";
        }
    };
    DefenseStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    DefenseStatus.prototype.getUtility = function () {
        return 2 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "damageTakenFold", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], DefenseStatus.prototype, "getUtility", null);
    return DefenseStatus;
}(AbstractStatus));
var DoomedStatus = (function (_super) {
    __extends(DoomedStatus, _super);
    function DoomedStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    DoomedStatus.prototype.add = function (other) {
        if (other instanceof DoomedStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    DoomedStatus.prototype.endTurn = function (affected, other) {
        this.amount--;
        if (this.amount === 0) {
            affected.actuallyDie();
        }
    };
    DoomedStatus.prototype.sameKind = function (other) {
        return other instanceof DoomedStatus;
    };
    DoomedStatus.prototype.clone = function () {
        return new DoomedStatus(this.amount);
    };
    DoomedStatus.prototype.getName = function () {
        return 'doomed';
    };
    DoomedStatus.prototype.getDescription = function () {
        if (this.amount === 1) {
            return "Die at the end of this turn.";
        }
        return "Die in " + this.amount + " turns.";
    };
    DoomedStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    DoomedStatus.prototype.getUtility = function () {
        return -100 * Math.pow(2, -this.amount);
    };
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], DoomedStatus.prototype, "getUtility", null);
    return DoomedStatus;
}(AbstractStatus));
var EnergizedStatus = (function (_super) {
    __extends(EnergizedStatus, _super);
    function EnergizedStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    EnergizedStatus.prototype.startTurn = function (affected, other) {
        affected.energy += this.amount;
    };
    EnergizedStatus.prototype.endTurn = function (affected, other) {
        this.amount = 0;
    };
    EnergizedStatus.prototype.add = function (other) {
        if (other instanceof EnergizedStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    EnergizedStatus.prototype.sameKind = function (other) {
        return other instanceof EnergizedStatus;
    };
    EnergizedStatus.prototype.clone = function () {
        return new EnergizedStatus(this.amount);
    };
    EnergizedStatus.prototype.getName = function () {
        return 'energized';
    };
    EnergizedStatus.prototype.getDescription = function () {
        return "Start with " + this.amount + " extra damage this turn.";
    };
    EnergizedStatus.prototype.getSortingNumber = function () {
        return 9;
    };
    EnergizedStatus.prototype.getUtility = function () {
        return 2 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "startTurn", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], EnergizedStatus.prototype, "getUtility", null);
    return EnergizedStatus;
}(AbstractStatus));
var EnergyDebtStatus = (function (_super) {
    __extends(EnergyDebtStatus, _super);
    function EnergyDebtStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    EnergyDebtStatus.prototype.energyGainedFold = function (acc, affected) {
        if (acc >= this.amount) {
            acc -= this.amount;
            this.amount = 0;
            return acc;
        }
        else {
            this.amount -= acc;
            return 0;
        }
    };
    EnergyDebtStatus.prototype.add = function (other) {
        if (other instanceof EnergyDebtStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    EnergyDebtStatus.prototype.sameKind = function (other) {
        return other instanceof EnergyDebtStatus;
    };
    EnergyDebtStatus.prototype.clone = function () {
        return new EnergyDebtStatus(this.amount);
    };
    EnergyDebtStatus.prototype.getName = function () {
        return 'energy Debt';
    };
    EnergyDebtStatus.prototype.getDescription = function () {
        return "The next " + this.amount + " Energy you gain will not count.";
    };
    EnergyDebtStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    EnergyDebtStatus.prototype.getUtility = function () {
        return -2 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "energyGainedFold", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], EnergyDebtStatus.prototype, "getUtility", null);
    return EnergyDebtStatus;
}(AbstractStatus));
var FreezeStatus = (function (_super) {
    __extends(FreezeStatus, _super);
    function FreezeStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    FreezeStatus.prototype.useTool = function (affected, other) {
        affected.loseEnergy(this.amount);
    };
    FreezeStatus.prototype.endTurn = function (affected, other) {
        this.amount = 0;
    };
    FreezeStatus.prototype.add = function (other) {
        if (other instanceof FreezeStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    FreezeStatus.prototype.sameKind = function (other) {
        return other instanceof FreezeStatus;
    };
    FreezeStatus.prototype.clone = function () {
        return new FreezeStatus(this.amount);
    };
    FreezeStatus.prototype.getName = function () {
        return 'freeze';
    };
    FreezeStatus.prototype.getDescription = function () {
        return "Lose " + this.amount + " energy whenever you use a tool this turn.";
    };
    FreezeStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    FreezeStatus.prototype.getUtility = function () {
        return -2 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "useTool", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], FreezeStatus.prototype, "getUtility", null);
    return FreezeStatus;
}(AbstractStatus));
var PoisonStatus = (function (_super) {
    __extends(PoisonStatus, _super);
    function PoisonStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    PoisonStatus.prototype.startTurn = function (affected, other) {
        affected.directDamage(this.amount);
        this.amount--;
    };
    PoisonStatus.prototype.add = function (other) {
        if (other instanceof PoisonStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    PoisonStatus.prototype.sameKind = function (other) {
        return other instanceof PoisonStatus;
    };
    PoisonStatus.prototype.clone = function () {
        return new PoisonStatus(this.amount);
    };
    PoisonStatus.prototype.getName = function () {
        return 'poison';
    };
    PoisonStatus.prototype.getDescription = function () {
        if (this.amount === 1) {
            return "Take 1 damage at the end of this turn.";
        }
        else {
            return "Take " + this.amount + " damage at the start of next turn. Decreases by one each turn.";
        }
    };
    PoisonStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    PoisonStatus.prototype.getUtility = function () {
        return -1 * ((this.amount) * (this.amount + 1)) / 2;
    };
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "startTurn", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], PoisonStatus.prototype, "getUtility", null);
    return PoisonStatus;
}(AbstractStatus));
var FungalStatus = (function (_super) {
    __extends(FungalStatus, _super);
    function FungalStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    FungalStatus.prototype.takeDamage = function (affected, other) {
        other.addStatus(new PoisonStatus(this.amount));
    };
    FungalStatus.prototype.add = function (other) {
        if (other instanceof FungalStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    FungalStatus.prototype.sameKind = function (other) {
        return other instanceof FungalStatus;
    };
    FungalStatus.prototype.clone = function () {
        return new FungalStatus(this.amount);
    };
    FungalStatus.prototype.getName = function () {
        return 'fungal';
    };
    FungalStatus.prototype.getDescription = function () {
        return "Opponent gains " + this.amount + " poison whenever you take damage.";
    };
    FungalStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    FungalStatus.prototype.getUtility = function () {
        return this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "takeDamage", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], FungalStatus.prototype, "getUtility", null);
    return FungalStatus;
}(AbstractStatus));
var MoneybagsStatus = (function (_super) {
    __extends(MoneybagsStatus, _super);
    function MoneybagsStatus(amount) {
        var _this = _super.call(this, amount, StatusValidators.POSITIVE) || this;
        _this.damageTaken = 0;
        return _this;
    }
    MoneybagsStatus.prototype.damageTakenFold = function (acc, affected) {
        this.damageTaken += acc;
        return acc;
    };
    MoneybagsStatus.prototype.takeDamage = function (affected, other) {
        if (other instanceof Player) {
            other.giveCurrency(Math.floor(this.damageTaken / this.amount));
        }
        this.damageTaken = this.damageTaken % this.amount;
    };
    MoneybagsStatus.prototype.add = function (other) {
        if (other instanceof MoneybagsStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    MoneybagsStatus.prototype.sameKind = function (other) {
        return other instanceof MoneybagsStatus;
    };
    MoneybagsStatus.prototype.clone = function () {
        return new MoneybagsStatus(this.amount);
    };
    MoneybagsStatus.prototype.getName = function () {
        return 'moneybags';
    };
    MoneybagsStatus.prototype.getDescription = function () {
        return "Give your opponent 1 Scrip for every " + this.amount + " damage you take.";
    };
    MoneybagsStatus.prototype.getSortingNumber = function () {
        return 900;
    };
    MoneybagsStatus.prototype.getUtility = function () {
        return 0;
    };
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "damageTakenFold", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "takeDamage", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], MoneybagsStatus.prototype, "getUtility", null);
    return MoneybagsStatus;
}(AbstractStatus));
var PacifistStatus = (function (_super) {
    __extends(PacifistStatus, _super);
    function PacifistStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    PacifistStatus.prototype.endTurn = function (affected, other) {
        this.amount--;
    };
    PacifistStatus.prototype.overridenUtilityFunction = function (bot, human) {
        return AiUtilityFunctions.friendlyUtility(bot, human);
    };
    PacifistStatus.prototype.add = function (other) {
        if (other instanceof PacifistStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    PacifistStatus.prototype.sameKind = function (other) {
        return other instanceof PacifistStatus;
    };
    PacifistStatus.prototype.clone = function () {
        return new PacifistStatus(this.amount);
    };
    PacifistStatus.prototype.getName = function () {
        return 'pacifist';
    };
    PacifistStatus.prototype.getDescription = function () {
        return 'Refuses to cause harm. Decreases by one each turn.';
    };
    PacifistStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    PacifistStatus.prototype.getUtility = function () {
        return -1 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "overridenUtilityFunction", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], PacifistStatus.prototype, "getUtility", null);
    return PacifistStatus;
}(AbstractStatus));
var RotStatus = (function (_super) {
    __extends(RotStatus, _super);
    function RotStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    RotStatus.prototype.endTurn = function (affected, other) {
        affected.directDamage(this.amount);
    };
    RotStatus.prototype.add = function (other) {
        if (other instanceof RotStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    RotStatus.prototype.sameKind = function (other) {
        return other instanceof RotStatus;
    };
    RotStatus.prototype.clone = function () {
        return new RotStatus(this.amount);
    };
    RotStatus.prototype.getName = function () {
        return 'rot';
    };
    RotStatus.prototype.getDescription = function () {
        return "Take " + this.amount + " damage at the end of every turn.";
    };
    RotStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    RotStatus.prototype.getUtility = function () {
        return -10 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "endTurn", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], RotStatus.prototype, "getUtility", null);
    return RotStatus;
}(AbstractStatus));
var ShieldStatus = (function (_super) {
    __extends(ShieldStatus, _super);
    function ShieldStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    ShieldStatus.prototype.damageTakenFold = function (acc, affected) {
        if (acc >= this.amount) {
            acc -= this.amount;
            this.amount = 0;
            return acc;
        }
        else {
            this.amount -= acc;
            return 0;
        }
    };
    ShieldStatus.prototype.add = function (other) {
        if (other instanceof ShieldStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    ShieldStatus.prototype.sameKind = function (other) {
        return other instanceof ShieldStatus;
    };
    ShieldStatus.prototype.clone = function () {
        return new ShieldStatus(this.amount);
    };
    ShieldStatus.prototype.getName = function () {
        return 'shield';
    };
    ShieldStatus.prototype.getDescription = function () {
        return "Block " + this.amount + " damage.";
    };
    ShieldStatus.prototype.getSortingNumber = function () {
        return 10;
    };
    ShieldStatus.prototype.getUtility = function () {
        return this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "damageTakenFold", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], ShieldStatus.prototype, "getUtility", null);
    return ShieldStatus;
}(AbstractStatus));
var StrengthStatus = (function (_super) {
    __extends(StrengthStatus, _super);
    function StrengthStatus(amount) {
        return _super.call(this, amount, StatusValidators.NONZERO) || this;
    }
    StrengthStatus.prototype.damageDealtFold = function (acc, affected) {
        return Math.max(1, acc + this.amount);
    };
    StrengthStatus.prototype.add = function (other) {
        if (other instanceof StrengthStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    StrengthStatus.prototype.sameKind = function (other) {
        return other instanceof StrengthStatus;
    };
    StrengthStatus.prototype.clone = function () {
        return new StrengthStatus(this.amount);
    };
    StrengthStatus.prototype.getName = function () {
        return 'strength';
    };
    StrengthStatus.prototype.getDescription = function () {
        if (this.amount > 0) {
            return "Deal " + this.amount + " more damage whenever you attack.";
        }
        else {
            return "Deal " + Math.abs(this.amount) + " less damage whenever you attack.";
        }
    };
    StrengthStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    StrengthStatus.prototype.getUtility = function () {
        return 2 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "damageDealtFold", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], StrengthStatus.prototype, "getUtility", null);
    return StrengthStatus;
}(AbstractStatus));
var SurviveStatus = (function (_super) {
    __extends(SurviveStatus, _super);
    function SurviveStatus(amount) {
        return _super.call(this, amount, StatusValidators.POSITIVE) || this;
    }
    SurviveStatus.prototype.die = function (affected, other) {
        affected.health = 1;
        this.amount--;
    };
    SurviveStatus.prototype.add = function (other) {
        if (other instanceof SurviveStatus) {
            this.amount += other.amount;
            return true;
        }
        return false;
    };
    SurviveStatus.prototype.sameKind = function (other) {
        return other instanceof SurviveStatus;
    };
    SurviveStatus.prototype.clone = function () {
        return new SurviveStatus(this.amount);
    };
    SurviveStatus.prototype.getName = function () {
        return 'survive';
    };
    SurviveStatus.prototype.getDescription = function () {
        if (this.amount === 1) {
            return "Survive the next killing blow.";
        }
        else {
            return "Survive the next " + this.amount + " killing blows.";
        }
    };
    SurviveStatus.prototype.getSortingNumber = function () {
        return 0;
    };
    SurviveStatus.prototype.getUtility = function () {
        return 10 * this.amount;
    };
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "die", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "add", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "sameKind", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "clone", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "getName", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "getDescription", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "getSortingNumber", null);
    __decorate([
        override(AbstractStatus)
    ], SurviveStatus.prototype, "getUtility", null);
    return SurviveStatus;
}(AbstractStatus));
traits.add('aluminum', new Trait('Aluminum', new DefenseStatus(1)), TraitTags.standard, TraitTags.randomable);
traits.add('counterfeiting', new Trait('Counterfeiting', new ExtraScrip(1)), TraitTags.elite, TraitTags.randomable);
traits.add('cunning', new Trait('Cunning', new FlowStatus(1)), TraitTags.coupdegracereward);
traits.add('decaying', new Trait('Decaying', new RotStatus(1)), TraitTags.curse, TraitTags.randomable);
traits.add('doomed', new Trait('Doomed', new DoomedStatus(10)), TraitTags.curse, TraitTags.randomable);
traits.add('electrified', new Trait('Electrified', new EnergizedStatus(2)), TraitTags.elite, TraitTags.randomable);
traits.add('frostbitten', new Trait('Frostbitten', new FreezeStatus(1)), TraitTags.curse, TraitTags.randomable);
traits.add('golden', new Trait('Golden', new MoneybagsStatus(5), new BatteryStatus(3)));
traits.add('hasty', new Trait('Hasty', new EnergizedStatus(2), new EnergyDebtStatus(2)), TraitTags.standard, TraitTags.randomable);
traits.add('healthy', new Trait('Healthy', new GiveHealth(5)), TraitTags.standard, TraitTags.randomable);
traits.add('herculean', new Trait('Herculean', new StrengthStatus(2)), TraitTags.elite, TraitTags.randomable);
traits.add('myceliated', new Trait('Myceliated', new FungalStatus(1)), TraitTags.standard, TraitTags.randomable);
traits.add('pacifist', new Trait('Pacifist', new PacifistStatus(4)));
traits.add('robust', new Trait('Robust', new GiveHealth(10)), TraitTags.elite, TraitTags.randomable);
traits.add('rowdy', new Trait('Rowdy', new ConfusionStatus(1), new StrengthStatus(1)), TraitTags.standard, TraitTags.randomable);
traits.add('sneezy', new Trait('Sneezy', new PoisonStatus(3)), TraitTags.curse, TraitTags.randomable);
traits.add('sodium', new Trait('Sodium', new DefenseStatus(-2)), TraitTags.curse, TraitTags.randomable);
traits.add('sunburned', new Trait('Sunburned', new BurnStatus(1)), TraitTags.curse, TraitTags.randomable);
traits.add('titanium', new Trait('Titanium', new DefenseStatus(2)), TraitTags.elite, TraitTags.randomable);
traits.add('tough', new Trait('Tough', new ShieldStatus(5)), TraitTags.standard, TraitTags.randomable);
traits.add('undying', new Trait('Undying', new SurviveStatus(3), new RotStatus(2)), TraitTags.elite, TraitTags.randomable);
traits.add('voltaic', new Trait('Voltaic', new BatteryStatus(20)));
tools.add('analgesic', new Tool('Analgesic', new Cost([5, CostTypes.Energy]), new GiveOtherTraitEffect(traits.get('tough')), new UsesPerFightMod(1)));
var TargetDeadPredicate = (function (_super) {
    __extends(TargetDeadPredicate, _super);
    function TargetDeadPredicate() {
        return _super.call(this) || this;
    }
    TargetDeadPredicate.prototype.evaluate = function (user, target) {
        return target.health <= 0;
    };
    TargetDeadPredicate.prototype.toString = function () {
        return "your opponent is dead";
    };
    return TargetDeadPredicate;
}(AbstractCombatPredicate));
var TargetStatusPredicate = (function (_super) {
    __extends(TargetStatusPredicate, _super);
    function TargetStatusPredicate(kind) {
        var _this = _super.call(this) || this;
        _this.kind = kind;
        return _this;
    }
    TargetStatusPredicate.prototype.evaluate = function (user, target) {
        return target.getStatusAmount(this.kind) >= this.kind.amount;
    };
    TargetStatusPredicate.prototype.toString = function () {
        if (this.kind.amount === 1) {
            return "if your opponent has any " + this.kind.getName();
        }
        return "if your opponent has at least " + this.kind.amount + " " + this.kind.getName();
    };
    return TargetStatusPredicate;
}(AbstractCombatPredicate));
var UserLacksStatusPredicate = (function (_super) {
    __extends(UserLacksStatusPredicate, _super);
    function UserLacksStatusPredicate(kind) {
        var _this = _super.call(this) || this;
        _this.kind = kind;
        return _this;
    }
    UserLacksStatusPredicate.prototype.evaluate = function (user, target) {
        return user.getStatusAmount(this.kind) == 0;
    };
    UserLacksStatusPredicate.prototype.toString = function () {
        return "you don't have " + this.kind.getName() + " status";
    };
    return UserLacksStatusPredicate;
}(AbstractCombatPredicate));
var UserStatusPredicate = (function (_super) {
    __extends(UserStatusPredicate, _super);
    function UserStatusPredicate(kind) {
        var _this = _super.call(this) || this;
        _this.kind = kind;
        return _this;
    }
    UserStatusPredicate.prototype.evaluate = function (user, target) {
        return user.getStatusAmount(this.kind) >= this.kind.amount;
    };
    UserStatusPredicate.prototype.toString = function () {
        if (this.kind.amount === 1) {
            return "you have any " + Strings.capitalize(this.kind.getName());
        }
        return "you have at least " + this.kind.amount + " " + Strings.capitalize(this.kind.getName());
    };
    return UserStatusPredicate;
}(AbstractCombatPredicate));
tools.add('armingkey', new Tool('Arming Key', new Cost([0, CostTypes.Energy]), new PredicateEffect(new UserStatusPredicate(new CountDownStatus(1, 1)), new NothingEffect(), (new PredicateEffect(new UserLacksStatusPredicate(new ConfusionStatus(1)), new GiveSelfStatusEffect(new CountDownStatus(5, 30)), new GiveSelfStatusEffect(new CountDownStatus(20, 30)))))));
tools.add('bandages', new Tool('Bandages', new Cost([1, CostTypes.Energy]), new HealingEffect(1)));
tools.add('bell', new Tool('Bell', new Cost(), new GainEnergyEffect(3), new PredicateEffect(new TargetStatusPredicate(new DoomedStatus(1)), new CombinationEffect(new GiveOtherStatusEffect(new DoomedStatus(2))), new CombinationEffect(new GiveSelfStatusEffect(new DefenseStatus(-1)))), new UsesPerTurnMod(1)));
tools.add('blaster', new Tool('Blaster', new Cost([2, CostTypes.Battery]), new DamageEffect(4)));
tools.add('boneclaws', new Tool('Bone Claws', new Cost([1, CostTypes.Energy]), new DamageEffect(2), new GiveOtherRandomTraitEffect()));
tools.add('claws', new Tool('Claws', new Cost([1, CostTypes.Energy]), new PredicateEffect(new UserStatusPredicate(new FlowStatus(1)), new CombinationEffect(new DamageEffect(3), new GiveSelfStatusEffect(new FlowStatus(-1))), new DamageEffect(1))));
tools.add('coat', new Tool('Coat', new Cost([1, CostTypes.Energy]), new GiveSelfStatusEffect(new ShieldStatus(5)), new UsesPerTurnMod(1)));
tools.add('comb', new Tool('Comb', new Cost([1, CostTypes.Energy]), new GiveSelfStatusEffect(new ShieldStatus(3)), new UsesPerTurnMod(1)));
tools.add('confusionray', new Tool('Confusion Ray', new Cost([5, CostTypes.Energy]), new GiveOtherStatusEffect(new ConfusionStatus(2)), new UsesPerTurnMod(1)));
tools.add('coupdegrace', new Tool('Coup de Grace', new Cost([1, CostTypes.Energy]), new DamageEffect(2), new PredicateEffect(new TargetDeadPredicate(), new GiveSelfRandomTraitEffect(TraitTags.coupdegracereward)), new UsesPerFightMod(1)));
tools.add('cowboyrevolver', new Tool('Cowboy Revolver', new Cost([4, CostTypes.Energy]), new NonlethalDamageEffect(3)));
tools.add('detox', new Tool('Detox', new Cost([1, CostTypes.Energy]), new PredicateEffect(new UserStatusPredicate(new PoisonStatus(1)), new CombinationEffect(new RemoveSelfStatusEffect(new PoisonStatus(1)), new HealingEffect(5)))));
tools.add('energizer', new Tool('Energizer', new Cost(), new CycleEffect(new GainEnergyEffect(1), new GainEnergyEffect(1), new GainEnergyEffect(1), new GiveSelfStatusEffect(new EnergyDebtStatus(3)))));
tools.add('forcefield', new Tool('Forcefield', new Cost([2, CostTypes.Battery]), new GiveSelfStatusEffect(new ShieldStatus(5))));
tools.add('geneburst', new Tool('Gene Burst', new Cost(), new TraitTriggeredEffect(new DamageEffect(2)), new LoseAllTraitsEffect()));
tools.add('holoarmor', new Tool('Holo-Armor', new Cost([3, CostTypes.Energy]), new GiveSelfStatusEffect(new DecoyStatus(1))));
tools.add('hourhand', new Tool('Hour Hand', new Cost([1, CostTypes.Energy]), new CounterEffect(new DamageEffect(12), 12)));
tools.add('jacket', new Tool('Jacket', new Cost([2, CostTypes.Energy]), new GiveSelfStatusEffect(new ShieldStatus(5)), new UsesPerTurnMod(1)));
tools.add('killscreen', new Tool('Kill Screen', new Cost(), new InstantKillEffect()));
tools.add('lighter', new Tool('Lighter', new Cost([1, CostTypes.Energy]), new GiveSelfStatusEffect(new BurnStatus(1)), new GiveSelfStatusEffect(new StrengthStatus(1))));
tools.add('mallet', new Tool('Mallet', new Cost([1, CostTypes.Energy]), new DamageEffect(1)));
tools.add('medicine', new Tool('Medicine', new Cost([5, CostTypes.Energy]), new GiveOtherTraitEffect(traits.get('healthy')), new UsesPerFightMod(1)));
tools.add('mitosisreflex', new Tool('Mitosis Reflex', new Cost([1, CostTypes.Energy]), new HealingEffect(-1), new HalveMaxHealthEffect()));
tools.add('mutagens', new Tool('Mutagens', new Cost([2, CostTypes.Energy]), new GiveSelfRandomTraitEffect()));
tools.add('mycelium', new Tool('Mycelium', new Cost([1, CostTypes.Energy]), new GiveSelfStatusEffect(new FungalStatus(1))));
tools.add('parasiticspores', new Tool('Parasitic Spores', new Cost([2, CostTypes.Energy]), new OwnStatusTriggeredEffect(new FungalStatus(1), new LeechEffect(2)), new RemoveSelfStatusEffect(new FungalStatus(1))));
tools.add('pendulum', new Tool('Pendulum', new Cost([3, CostTypes.Energy]), new PredicateEffect(new TargetStatusPredicate(new DoomedStatus(1)), new GiveOtherStatusEffect(new DoomedStatus(-1)), new GiveOtherStatusEffect(new DoomedStatus(10))), new UsesPerTurnMod(1)));
tools.add('radio', new Tool('Radio', new Cost([2, CostTypes.Energy]), new GiveOtherStatusEffect(new AngryStatus(1)), new UsesPerTurnMod(1)));
tools.add('rawhideskin', new Tool('Rawhide Skin', new Cost([2, CostTypes.Energy]), new PayWithRandomTraitEffect(new GiveSelfStatusEffect(new ShieldStatus(5)))));
tools.add('recharge', new Tool('Recharge', new Cost([3, CostTypes.Health]), new GiveSelfStatusEffect(new BatteryStatus(2))));
tools.add('reinforce', new Tool('Reinforce', new Cost([1, CostTypes.Energy]), new GiveSelfStatusEffect(new ShieldStatus(10))));
tools.add('scalpel', new Tool('Scalpel', new Cost([1, CostTypes.Energy]), new DamageEffect(2)));
tools.add('selfrepair', new Tool('Self Repair', new Cost([3, CostTypes.Battery]), new HealingEffect(2)));
tools.add('singleton', new Tool('Singleton', new Cost([1, CostTypes.Energy]), new DamageEffect(5), new UsesPerTurnMod(1)));
tools.add('sixshooter', new Tool('Six Shooter', new Cost([3, CostTypes.Energy]), new RepeatingEffect(new DamageEffect(1), 6), new UsesPerTurnMod(1)));
tools.add('splash', new Tool('Splash', new Cost([1, CostTypes.Energy]), new NothingEffect()));
tools.add('sporecloud', new Tool('Spore Cloud', new Cost([2, CostTypes.Energy]), new OwnStatusTriggeredEffect(new FungalStatus(1), new DamageEffect(2)), new RemoveSelfStatusEffect(new FungalStatus(1))));
tools.add('surgicallaser', new Tool('Surgical Laser', new Cost([2, CostTypes.Energy]), new DamageEffect(20)));
tools.add('switchblade', new Tool('Switchblade', new Cost([1, CostTypes.Energy]), new DamageEffect(1), new UsesPerTurnMod(1)));
tools.add('thermocouple', new Tool('Thermocouple', new Cost([2, CostTypes.Energy]), new CycleEffect(new GiveOtherStatusEffect(new BurnStatus(1)), new GiveOtherStatusEffect(new FreezeStatus(1)))));
tools.add('thumbtack', new Tool('Thumbtack', new Cost(), new BackfireEffect(1)));
tools.add('toxicblood', new Tool('Toxic Blood', new Cost([1, CostTypes.Health]), new GiveOtherStatusEffect(new PoisonStatus(2))));
tools.add('veil', new Tool('Veil', new Cost([2, CostTypes.Energy]), new ChangeUserNegativeStatuses(-1)));
tools.add('widebrimmedhat', new Tool('Wide Brimmed Hat', new Cost([1, CostTypes.Energy]), new GiveSelfStatusEffect(new StrengthStatus(1)), new UsesPerFightMod(1)));
tools.add('windupraygun', new Tool('Wind-Up Ray Gun', new Cost([1, CostTypes.Energy]), new CounterEffect(new DamageEffect(10), 3), new UsesPerTurnMod(1)));
modifiers.add('annoying', new Modifier('Annoying', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.25, new GiveOtherStatusEffect(new AngryStatus(1)))));
modifiers.add('burning', new Modifier('Burning', new GiveSelfStatusEffect(new BurnStatus(1)), new GiveOtherStatusEffect(new BurnStatus(2))));
modifiers.add('chilled', new Modifier('Chilled', new ChanceEffect(0.25, new GiveOtherStatusEffect(new FreezeStatus(1)))));
modifiers.add('dazzling', new Modifier('Dazzling', new ChanceEffect(0.15, new GiveOtherStatusEffect(new ConfusionStatus(2)))));
modifiers.add('dizzying', new Modifier('Dizzying', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.25, new GiveSelfStatusEffect(new ConfusionStatus(1)))));
modifiers.add('draining', new Modifier('Draining', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.125, new LoseEnergyEffect(1))));
modifiers.add('faustian', new Modifier('Faustian', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.01, new GiveSelfStatusEffect(new DoomedStatus(1)))));
modifiers.add('freezing', new Modifier('Freezing', new GiveSelfStatusEffect(new FreezeStatus(1)), new GiveOtherStatusEffect(new FreezeStatus(2))));
modifiers.add('guilting', new Modifier('Guilting', new ChanceEffect(0.1, new GiveOtherStatusEffect(new PacifistStatus(1)))));
modifiers.add('hearty', new Modifier('Hearty', new CounterEffect(new HealingEffect(1), 5)));
modifiers.add('heated', new Modifier('Heated', new ChanceEffect(0.25, new GiveOtherStatusEffect(new BurnStatus(1)))));
modifiers.add('jittering', new Modifier('Jittering', [ModifierTypes.CostMult, 2], [ModifierTypes.MultAdd, 1]));
modifiers.add('lightweight', new Modifier('Lightweight', [ModifierTypes.CostMult, 0], [ModifierTypes.UsesPerTurn, 1]));
modifiers.add('liquidcooled', new Modifier('Liquid-Cooled', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.25, new GiveSelfStatusEffect(new FreezeStatus(1)))));
modifiers.add('loaned', new Modifier('Loaned', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.25, new GiveSelfStatusEffect(new EnergyDebtStatus(1)))));
modifiers.add('mildewed', new Modifier('Mildewed', new ChanceEffect(0.25, new GiveSelfStatusEffect(new FungalStatus(1)))));
modifiers.add('moldy', new Modifier('Moldy', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.125, new GiveOtherStatusEffect(new FungalStatus(1)))));
modifiers.add('overclocked', new Modifier('Overclocked', [ModifierTypes.MultAdd, 1], new ChanceEffect(0.25, new GiveSelfStatusEffect(new BurnStatus(1)))));
modifiers.add('purifying', new Modifier('Purifying', [ModifierTypes.AddEnergyCost, 2], new ChangeUserNegativeStatuses(-1)));
modifiers.add('sparkling', new Modifier('Sparkling', new ChanceEffect(0.125, new GiveSelfStatusEffect(new EnergizedStatus(1)))));
modifiers.add('spiky', new Modifier('Spiky', [ModifierTypes.AddEnergyCost, 1], new DamageEffect(1)));
modifiers.add('strengthening', new Modifier('Strengthening', new CounterEffect(new GiveSelfStatusEffect(new StrengthStatus(1)), 5)));
modifiers.add('toxic', new Modifier('Toxic', new GiveOtherStatusEffect(new PoisonStatus(2)), new GiveSelfStatusEffect(new PoisonStatus(1))));
modifiers.add('vampiric', new Modifier('Vampiric', [ModifierTypes.EnergyToHealth, 0]));
characters.addSorted('catburglar', new Player('The Catburglar', 9, 9, [
    tools.get('claws'),
    tools.get('radio'),
    tools.get('holoarmor'),
    tools.get('coupdegrace')
], [traits.get('counterfeiting')], 'assets/The_Catburgurlar.png', 'tiles/character tiles/the cat.png'), 2, CharacterTags.inFinalGame);
characters.addSorted('clone', new Player('The Clone', 10, 10, [
    tools.get('windupraygun'),
    tools.get('confusionray'),
    tools.get('thermocouple'),
    tools.get('energizer'),
], [], 'assets/The_Clone.png', 'tiles/character tiles/the clone.png'), 1, CharacterTags.inFinalGame);
characters.addSorted('kid', new Player('The Granddaughter', 15, 10, [
    tools.get('mallet'),
    tools.get('veil'),
    tools.get('lighter'),
    tools.get('jacket'),
    tools.get('thumbtack')
], [], 'assets/thegranddaughter.png', 'tiles/character tiles/granddaughter.png'), 0, CharacterTags.inFinalGame);
characters.addSorted('reject', new Player('The Reject', 10, 6, [
    tools.get('mutagens'),
    tools.get('boneclaws'),
    tools.get('rawhideskin'),
    tools.get('geneburst'),
    tools.get('toxicblood')
], [], 'assets/The_Reject_-_Done.png', 'tiles/character tiles/the reject.png'), 5, CharacterTags.inFinalGame);
characters.addSorted('shell', new Player('The Shell', 10, 4, [
    tools.get('selfrepair'),
    tools.get('blaster'),
    tools.get('forcefield'),
    tools.get('recharge'),
], [
    traits.get('voltaic')
], 'assets/the_shell.png', 'tiles/character tiles/the shell.png'), 4, CharacterTags.inFinalGame);
characters.addSorted('troubleshooter', new Player('The Troubleshooter', 100, 100, [
    tools.get('killscreen')
], []), 10);
enemies.add('century', new Enemy('Century', 50, 7, AiUtilityFunctions.cautiousUtility, [
    tools.get('pendulum'),
    tools.get('bell'),
    tools.get('hourhand')
], []), EnemyTags.boss);
enemies.add('creepingcarpet', new Enemy('Creeping Carpet', 10, 2, AiUtilityFunctions.cautiousUtility, [tools.get('mycelium'), tools.get('sporecloud')], []), EnemyTags.level1);
enemies.add('crickettron', new Enemy('Cricket-Tron', 25, 5, AiUtilityFunctions.cautiousUtility, [
    modifiers.get('strengthening').apply(tools.get('mallet'))
], []), EnemyTags.level2);
enemies.add('dearthcap', new Enemy('Dearth Cap', 20, 4, AiUtilityFunctions.cautiousUtility, [
    tools.get('mycelium'),
    tools.get('parasiticspores')
], []), EnemyTags.level3);
enemies.add('delinquentgoldfish', new Enemy('Delinquent Goldfish', 100, 2, AiUtilityFunctions.aggressiveUtility, [tools.get('switchblade'), tools.get('splash')], [traits.get('golden')], 'assets/goldfish.png'), EnemyTags.goldfish);
enemies.add('goldfish', new Enemy('Goldfish', 100, 1, AiUtilityFunctions.cautiousUtility, [tools.get('splash')], [traits.get('golden')], 'assets/goldfish.png'), EnemyTags.goldfish);
enemies.add('greasertron', new Enemy('Greaser-Tron', 10, 6, AiUtilityFunctions.cautiousUtility, [tools.get('lighter'), tools.get('switchblade'), tools.get('comb')], []), EnemyTags.level1);
enemies.add('sheriff', new Enemy('Sheriff-omatic', 10, 5, AiUtilityFunctions.cautiousUtility, [
    tools.get('cowboyrevolver'),
    tools.get('widebrimmedhat'),
], []), EnemyTags.level1);
enemies.add('slimemoulder', new Enemy('Slime Moulder', 20, 2, AiUtilityFunctions.cautiousUtility, [
    tools.get('mycelium'),
    tools.get('sporecloud'),
    tools.get('mitosisreflex'),
], []), EnemyTags.level2);
enemies.add('surgeonbot', new Enemy('Surgery Bot', 20, 2, AiUtilityFunctions.aggressiveUtility, [
    tools.get('surgicallaser'), tools.get('coat')
], [
    traits.get('pacifist')
]), EnemyTags.level3);
enemies.add('timebomb', new Enemy('Tim Bomb', 40, 1, AiUtilityFunctions.defensiveUtility, [tools.get('reinforce'), tools.get('detox'), tools.get('armingkey')], []), EnemyTags.level2);
enemies.add('medicbot', new Enemy('Medic Bot', 5, 5, AiUtilityFunctions.friendlyUtility, [
    tools.get('medicine'), tools.get('analgesic'), tools.get('surgicallaser'), tools.get('scalpel')
], []), EnemyTags.level2);
window.onload = function () {
    SoundManager.init();
    Save.loadSettings();
    NotePool.reloadAllNotes();
    Save.loadNotes();
    var button = UI.makeButton('Enter the Game', function () { return Game.showTitle(); }, false, 'enter-button');
    var div = UI.makeDiv('enter-wrap');
    div.appendChild(button);
    UI.fillScreen(div);
    document.onkeydown = function (e) {
        UI.handleKeyDown(e);
    };
    var preloadImages = [
        'The_Catburgurlar.png',
        'The_Clone.png',
        'The_Reject_-_Done.png',
        'final_logo.png',
        'random.png',
        'the_shell.png',
        'thegranddaughter.png',
    ];
    for (var _i = 0, preloadImages_1 = preloadImages; _i < preloadImages_1.length; _i++) {
        var img = preloadImages_1[_i];
        var el = new Image();
        el.src = img;
    }
};
if (window.innerHeight === 0) {
    window.console.log('tools', tools);
    window.console.log('modifiers', modifiers);
    window.console.log('enemies', enemies);
    window.console.log('characters', characters);
}
