/// <reference path="../ItemPool.ts" />
/// <reference path="../Tool.ts" />
/// <reference path="../effects.ts" />
tools.add('sixshooter',
  new Tool('Six Shooter', new Cost([1, CostTypes.Energy]), new RepeatingEffect(new DamageEffect(1), 6), new UsesMod(1))
);