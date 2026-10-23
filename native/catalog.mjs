import { ModuleRegistry } from './modules/registry.mjs';
import { inputModule } from './gameplay/input.mjs';
import { sysModule } from './gameplay/sys.mjs';
import { mapModule } from './gameplay/map.mjs';
import { playerModule } from './gameplay/player.mjs';
import { loggerModule } from './gameplay/logger.mjs';
import { levelModule } from './gameplay/level.mjs';
import { exploreModule } from './gameplay/explore.mjs';
import { itemModule } from './gameplay/items.mjs';
import { metmanModule } from './gameplay/metman.mjs';
import { corpseModule } from './gameplay/corpse.mjs';
import { enemyModule } from './gameplay/enemy.mjs';
import { battleModule } from './gameplay/battle.mjs';
import { attackModule } from './gameplay/attack.mjs';
import { weaponModule } from './gameplay/weapon.mjs';
import { weaponKindModules, dualWeaponModule } from './gameplay/weapon-kinds.mjs';
import { skillbaseModule } from './gameplay/skills.mjs';
import { gameflowModules } from './gameplay/gameflow.mjs';
import { armorModule, armorArtModule } from './gameplay/base-extra/armor.mjs';
import { poseModule, tacticModule } from './gameplay/base-extra/pose-tactic.mjs';
import { restModule } from './gameplay/base-extra/rest.mjs';
import { woundModule } from './gameplay/base-extra/wound.mjs';
import { weatherModule } from './gameplay/base-extra/weather.mjs';
import { trapModule } from './gameplay/base-extra/trap.mjs';
import { noiseModule, cooldownModule, apmModule, openingModule } from './gameplay/base-extra/timing.mjs';
import { npcModule, npcchatModule } from './gameplay/base-extra/npc.mjs';
import { addnpcModule } from './gameplay/base-extra/addnpc.mjs';
import { userSettingsModule } from './accounts/settings.mjs';
import { teamModule } from './gameplay/base-extra/team.mjs';
import { itemshopModule } from './gameplay/base-extra/itemshop.mjs';
import { itemmixModule } from './gameplay/base-extra/itemmix.mjs';
import { createSkillCatalog } from './gameplay/skills.mjs';

export const nativeGameplayModules = Object.freeze([
  inputModule, sysModule, mapModule, playerModule, loggerModule, levelModule,
  exploreModule, itemModule, metmanModule, corpseModule, enemyModule,
  battleModule, attackModule, weaponModule, ...weaponKindModules,
  dualWeaponModule, skillbaseModule, ...gameflowModules,
  armorModule, armorArtModule, poseModule, tacticModule, restModule,
  woundModule, weatherModule,
  trapModule,
  noiseModule, cooldownModule, apmModule, openingModule, npcModule, npcchatModule,
  addnpcModule, userSettingsModule,
  teamModule,
  itemshopModule,
  itemmixModule,
]);

/** Resolve an explicit complete module configuration before initializing any
 * game state or connecting services. Keep its order for original FIFO sorting.
 * A missing port is an error, never a disabled feature, empty module or PHP
 * fallback. Passing a small deliberate selection is useful for development;
 * it does not certify that selection as the original full game.
 */
export function createNativeGameRegistry(configuration, additionalModules = []) {
  return createNativeGamePlan(configuration, additionalModules).registry;
}

/** Immutable code/metadata plan. Rebuild when the host activates a new module
 * configuration; live states, initialization and hook publication still run
 * independently in every session. Nothing here contains player/request data. */
export function createNativeGamePlan(configuration, additionalModules = [], infoById = {}) {
  if (!Array.isArray(configuration) || !configuration.length) throw new TypeError('A complete explicit module configuration is required');
  const available = new Map();
  for (const definition of [...nativeGameplayModules, ...additionalModules]) {
    if (typeof definition.name !== 'string') throw new TypeError('Native module requires a name');
    const name = definition.name.toLowerCase();
    if (available.has(name)) throw new Error(`Duplicate native module implementation: ${name}`);
    available.set(name, definition);
  }
  const selected = [], missing = [], seen = new Set();
  for (const entry of configuration) {
    if (!entry || typeof entry.name !== 'string' || typeof entry.enabled !== 'boolean') throw new TypeError('Module configuration entries require name and boolean enabled');
    const name = entry.name.toLowerCase();
    if (seen.has(name)) throw new Error(`Duplicate configured module: ${name}`);
    seen.add(name);
    if (!entry.enabled) continue;
    if (!available.has(name)) missing.push(name);
    else selected.push(available.get(name));
  }
  if (missing.length) {
    const error = new Error(`Native implementations missing for ${missing.length} configured modules: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ', …' : ''}`);
    error.code = 'NATIVE_MODULES_UNAVAILABLE';
    error.missingModules = Object.freeze(missing);
    throw error;
  }
  const enabled = Object.freeze(configuration.filter(entry => entry.enabled).map(entry => entry.name.toLowerCase()));
  const enabledSet = new Set(enabled);
  const definitions = Object.freeze([...available.values()].filter(definition => enabledSet.has(definition.name.toLowerCase())));
  return Object.freeze({ registry: new ModuleRegistry(selected), selected: definitions, enabled,
    skills: createSkillCatalog(definitions, infoById) });
}
