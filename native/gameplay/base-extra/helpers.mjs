import { text, number, sameDurability } from '../numbers.mjs';

// Explicit PHP integer casts for user command suffixes. Arithmetic game fields
// continue to use the stricter numeric boundary in numbers.mjs.
export const integer = value => {
  if (value == null || value === false) return 0;
  if (value === true) return 1;
  const parsed = Number(text(value).match(/^[\t\n\r\f\v ]*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)?.[0] ?? 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
};
export const eq = sameDurability;
export const min = (left, right) => number(left) <= number(right) ? left : right;
export const call = (ctx, name, ...args) => ctx.call(ctx.moduleName, name, ...args);
export function mergeEquipment(ctx, list, iteminfo) {
  const player = ctx.state('player'), items = ctx.state('itemmain');
  player.equip_list = [...player.equip_list, ...list];
  player.battle_equip_list = [...player.battle_equip_list, ...list];
  for (const [key, value] of Object.entries(iteminfo)) if (!Object.hasOwn(items.iteminfo, key)) items.iteminfo[key] = value;
}
