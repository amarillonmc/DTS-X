import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Migration planning only: this is deliberately not a PHP parser or compiler.
// It ignores comments/string bodies when finding declarations and language
// features. Dynamic definitions, interpolations and includes need review.
const project = fileURLToPath(new URL('../', import.meta.url));
const engine = path.join(project, 'engine');
const manifest = JSON.parse(await readFile(path.join(project, 'upstream/manifest.json'), 'utf8'));
const hash = data => createHash('sha256').update(data).digest('hex');
const args = process.argv.slice(2);
let check = false;
let output = path.join(project, 'native/inventory.json');
let statusPath = path.join(project, 'native/migration-status.json');
let customStatus = false;
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--check') check = true;
  else if (['--output', '--status'].includes(args[index]) && args[index + 1]) {
    const option = args[index++];
    if (option === '--output') output = path.resolve(args[index]);
    else { statusPath = path.resolve(args[index]); customStatus = true; }
  } else throw new Error(`Unknown or incomplete option: ${args[index]}`);
}
let migrationStatus = { schemaVersion: 1, modules: {} };
let migrationStatusHash = null;
try {
  const raw = await readFile(statusPath);
  migrationStatus = JSON.parse(raw.toString('utf8'));
  migrationStatusHash = hash(raw);
} catch (error) {
  if (customStatus || error.code !== 'ENOENT') throw error;
}
if (migrationStatus.schemaVersion !== 1 || !migrationStatus.modules || typeof migrationStatus.modules !== 'object' || Array.isArray(migrationStatus.modules)) throw new Error('Migration status requires schemaVersion 1 and a modules object');
for (const [name, record] of Object.entries(migrationStatus.modules)) {
  if (!['not_ported', 'partial', 'code_ported'].includes(record.status)) throw new Error(`Unsupported migration status for ${name}: code inventory cannot certify gameplay completion`);
  if (!Array.isArray(record.implementation) || !Array.isArray(record.evidence) || !Array.isArray(record.remaining)) throw new Error(`Migration ${name} requires implementation, evidence and remaining arrays`);
  if (record.status !== 'not_ported' && (!record.implementation.length || !record.remaining.length)) throw new Error(`Migration ${name} requires explicit implementation and unverified boundaries`);
  for (const file of record.implementation) {
    if (typeof file !== 'string' || !/^native\/[A-Za-z0-9_./-]+\.mjs$/.test(file) || file.split('/').includes('..')) throw new Error(`Unsafe native implementation path for ${name}`);
    await readFile(path.join(project, file));
  }
  for (const evidence of record.evidence) {
    if (!evidence || typeof evidence.test !== 'string' || !/^tests\/[A-Za-z0-9_./-]+\.test\.mjs$/.test(evidence.test) || evidence.test.split('/').includes('..') || typeof evidence.scope !== 'string' || !evidence.scope.trim() || !['passed', 'not_run'].includes(evidence.result)) throw new Error(`Migration ${name} has invalid differential evidence`);
    await readFile(path.join(project, evidence.test));
  }
}

function lexPhp(text) {
  const tokens = [];
  const codeLines = new Set();
  let offset = 0;
  let line = 1;
  let php = false;
  const consume = (end, kind) => {
    const value = text.slice(offset, end);
    if (kind) {
      tokens.push({ kind, value, line });
      for (let n = 0; n <= (value.match(/\n/g) || []).length; n++) codeLines.add(line + n);
    }
    line += (value.match(/\n/g) || []).length;
    offset = end;
  };
  while (offset < text.length) {
    if (!php) {
      const next = text.indexOf('<?', offset);
      if (next < 0) break;
      consume(next);
      const tag = text.slice(offset).match(/^<\?(?:php\b|=)?/i)[0];
      consume(offset + tag.length);
      php = true;
      continue;
    }
    const tail = text.slice(offset);
    if (tail.startsWith('?>')) { consume(offset + 2); php = false; continue; }
    const space = tail.match(/^\s+/);
    if (space) { consume(offset + space[0].length); continue; }
    if (tail.startsWith('//') || tail[0] === '#') {
      let end = text.indexOf('\n', offset);
      if (end < 0) end = text.length;
      const close = text.indexOf('?>', offset);
      if (close >= 0 && close < end) end = close;
      consume(end);
      continue;
    }
    if (tail.startsWith('/*')) {
      const end = text.indexOf('*/', offset + 2);
      consume(end < 0 ? text.length : end + 2);
      continue;
    }
    const heredoc = tail.match(/^<<<[ \t]*['"]?([A-Za-z_][\w]*)['"]?[ \t]*\r?\n/);
    if (heredoc) {
      const remaining = tail.slice(heredoc[0].length);
      const end = new RegExp(`^[ \\t]*${heredoc[1]}(?=[;,\\r\\n]|$)`, 'm').exec(remaining);
      consume(end ? offset + heredoc[0].length + end.index + end[0].length : text.length, 'string');
      continue;
    }
    if (tail[0] === "'" || tail[0] === '"' || tail[0] === '`') {
      let end = offset + 1;
      while (end < text.length) {
        if (text[end] === '\\') { end += 2; continue; }
        if (text[end++] === tail[0]) break;
      }
      consume(Math.min(end, text.length), 'string');
      continue;
    }
    const variable = tail.match(/^\$[A-Za-z_\x80-\uffff][\w\x80-\uffff]*/);
    if (variable) { consume(offset + variable[0].length, 'variable'); continue; }
    const identifier = tail.match(/^[A-Za-z_\x80-\uffff][\w\x80-\uffff]*/);
    if (identifier) { consume(offset + identifier[0].length, 'identifier'); continue; }
    const operator = tail.match(/^(?:===|!==|<=>|==|!=|<>|=>|::|->|&&|\|\||\+\+|--|\*\*|<<|>>|\?\?|\.\=|\+=|-=|\*=|\/=)/);
    consume(offset + (operator ? operator[0].length : 1), 'symbol');
  }
  return { tokens, codeLines: codeLines.size };
}

function inspectPhp(source) {
  const { tokens, codeLines } = lexPhp(source);
  const declarations = [];
  const features = {};
  const count = key => { features[key] = (features[key] || 0) + 1; };
  const calls = new Map();
  const lower = i => tokens[i]?.value.toLowerCase();
  let namespace = '';
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const value = lower(i);
    if (value === 'namespace') {
      namespace = '';
      for (let j = i + 1; j < tokens.length && !['{', ';'].includes(tokens[j].value); j++) namespace += tokens[j].value;
    }
    if (value === 'function') {
      let j = i + 1;
      const returnsReference = tokens[j]?.value === '&';
      if (returnsReference) j++;
      const named = tokens[j]?.kind === 'identifier';
      const name = named ? tokens[j++].value : null;
      if (tokens[j]?.value !== '(') continue;
      let depth = 1;
      let referenceParameters = 0;
      while (++j < tokens.length && depth) {
        if (tokens[j].value === '(') depth++;
        if (tokens[j].value === ')') depth--;
        if (tokens[j].value === '&' && tokens[j + 1]?.kind === 'variable') referenceParameters++;
      }
      if (returnsReference) count('referenceReturnDeclarations');
      if (referenceParameters) features.referenceParameters = (features.referenceParameters || 0) + referenceParameters;
      if (name) declarations.push({ name, namespace, line: token.line, referenceParameters, returnsReference });
      else count('anonymousFunctions');
    }
    if (token.kind === 'identifier' && tokens[i + 1]?.value === '(' && !['function', 'new'].includes(lower(i - 1))) calls.set(value, (calls.get(value) || 0) + 1);
    if (['include', 'include_once', 'require', 'require_once'].includes(value)) count('includeOrRequireSites');
    if (value === 'global') count('globalStatements');
    if (value === 'static' && tokens[i + 1]?.kind === 'variable') count('staticVariables');
    if (value === '$' && ['variable', 'symbol'].includes(tokens[i + 1]?.kind)) count('variableVariableSites');
    if (token.kind === 'variable' && tokens[i + 1]?.value === '(') count('variableFunctionCallSites');
    if (value === '=' && tokens[i + 1]?.value === '&') count('referenceAssignments');
    if (['==', '!=', '<>'].includes(value)) count('looseComparisons');
    if (value === 'new' && lower(i + 1) === 'reflectionfunction') count('reflectionFunctions');
  }
  for (const name of ['eval', 'import_module', 'get_var_in_module', 'get_var_input', 'debug_backtrace', 'rand', 'mt_rand', 'shuffle', 'array_rand', 'flock', 'serialize', 'unserialize', 'json_encode', 'json_decode']) {
    if (calls.has(name)) features[`${name}CallSites`] = calls.get(name);
  }
  return { physicalLines: source.split('\n').length, lexicalCodeLines: codeLines, declarations, features };
}

const sourceFiles = [];
const php = new Map();
const sourceDeviations = [];
for (const original of manifest.files) {
  const bytes = await readFile(path.join(engine, original.path));
  const sha256 = hash(bytes);
  if (sha256 !== original.sha256) sourceDeviations.push(original.path);
  const kind = original.path.endsWith('.php') ? 'php' : /\.(htm|html)$/i.test(original.path) ? 'template' : 'resource';
  const item = { path: original.path, bytes: bytes.length, sha256, kind };
  if (kind === 'php') {
    const stats = inspectPhp(bytes.toString('utf8'));
    php.set(original.path, stats);
    item.physicalLines = stats.physicalLines;
    item.lexicalCodeLines = stats.lexicalCodeLines;
    item.namedDeclarations = stats.declarations.length;
    item.features = stats.features;
  }
  sourceFiles.push(item);
}

const listPath = 'gamedata/modules.list.php';
const modules = [];
const chains = new Map();
const missingDeclarations = [];
const list = (await readFile(path.join(engine, listPath), 'utf8')).split(/\r?\n/).filter(Boolean);
for (const [order, row] of list.entries()) {
  const [name, relative, enabled] = row.split(',');
  if (!name || !relative || !/^[01]$/.test(enabled)) throw new Error(`Invalid module record ${order + 1}`);
  const root = `include/modules/${relative}`;
  if (!path.resolve(engine, root).startsWith(path.resolve(engine, 'include/modules') + path.sep)) throw new Error(`Unsafe module path ${relative}`);
  const declarationPath = `${root}module.inc.php`;
  const declaration = await readFile(path.join(engine, declarationPath), 'utf8');
  const field = key => {
    const match = declaration.match(new RegExp(`\\$___MODULE_${key}\\s*=\\s*['"]([^'"]*)['"]`));
    if (!match) throw new Error(`Missing module ${key}: ${name}`);
    return match[1].split(/\s+/).filter(Boolean);
  };
  const code = [];
  const functions = [];
  for (const file of field('codelist')) {
    let sourcePath = `${root}${file}`;
    const sampled = !php.has(sourcePath) && name === 'sys' && /^config\/(server|system|game)\.config\.php$/.test(file);
    if (sampled) sourcePath = sourcePath.replace('.config.php', '.config.sample.php');
    const stats = php.get(sourcePath);
    if (!stats) missingDeclarations.push(sourcePath);
    code.push({ declared: file, source: sourcePath, sampleConfiguration: sampled });
    for (const fn of stats?.declarations || []) {
      if (fn.namespace.toLowerCase() !== name.toLowerCase()) continue;
      functions.push({ ...fn, source: sourcePath });
      if (enabled === '1' && !['init', '___pre_init', '___post_init'].includes(fn.name.toLowerCase())) {
        const key = fn.name.toLowerCase();
        if (!chains.has(key)) chains.set(key, []);
        chains.get(key).push({ module: name, order, source: sourcePath, line: fn.line });
      }
    }
  }
  modules.push({
    name, order, enabled: enabled === '1', sourceRoot: root, declaration: declarationPath,
    dependencies: field('dependency'), optionalDependencies: field('dependency_optional'), conflicts: field('conflict'),
    code, templates: field('templatelist').map(file => `${root}${file}.htm`), functions,
    migration: migrationStatus.modules[name] ?? { status: 'not_ported', implementation: [], evidence: [], remaining: ['Native code and behavioral validation are not registered.'] },
  });
}
for (const name of Object.keys(migrationStatus.modules)) if (!modules.some(module => module.name === name)) throw new Error(`Unknown upstream module in migration status: ${name}`);

const sum = (values, field) => values.reduce((total, item) => total + (item[field] || 0), 0);
const phpFiles = sourceFiles.filter(file => file.kind === 'php');
const declaredCodePaths = new Set(modules.flatMap(mod => mod.code.map(code => code.source)));
const features = {};
for (const stats of php.values()) for (const [key, value] of Object.entries(stats.features)) features[key] = (features[key] || 0) + value;
const hookChains = [...chains.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, declarations]) => ({ name, declarations, entry: declarations.at(-1), verification: 'static_declarations_only' }));
const inventory = {
  schemaVersion: 1,
  purpose: 'Source baseline, dependency graph, static hook declaration order, and explicitly reported migration evidence. This file is not a coverage certificate.',
  source: { repository: manifest.repository, branch: manifest.branch, commit: manifest.commit, manifest: 'upstream/manifest.json', moduleList: listPath, deviations: sourceDeviations },
  methodology: {
    scope: 'Only upstream manifest files under engine/; no live state, environment files or databases are read.',
    effectiveSize: 'lexicalCodeLines counts lines containing PHP tokens outside comments/whitespace and includes complete multiline string literals; physicalLines includes configuration data and inline HTML.',
    limits: ['Lightweight lexical scan, not a validating parser.', 'String interpolation, dynamically included or generated declarations, conditions around declarations, and class methods require review.', 'Hook chains follow enabled module order and functions declared in codelist; actual runtime registration is not executed.', 'Migration states are explicitly declared in native/migration-status.json; file existence and matching function counts never imply a completed port. Differential evidence is reported with a scope and is not rerun by this inventory.'],
  },
  migration: { statusFile: 'native/migration-status.json', statusSha256: migrationStatusHash, nativeGameReady: migrationStatus.acceptance?.nativeGameReady===true && modules.every(module=>module.migration.status==='code_ported'), note: 'Readiness is an explicitly recorded acceptance result, not inferred from static inventory or file counts. This command does not rerun behavioral tests.', counts: Object.fromEntries(['not_ported', 'partial', 'code_ported'].map(status => [status, modules.filter(module => module.migration.status === status).length])) },
  totals: {
    sourceFiles: sourceFiles.length, sourceBytes: sum(sourceFiles, 'bytes'), phpFiles: phpFiles.length,
    phpPhysicalLines: sum(phpFiles, 'physicalLines'), phpLexicalCodeLines: sum(phpFiles, 'lexicalCodeLines'),
    namedPhpDeclarations: sum(phpFiles, 'namedDeclarations'), modules: modules.length,
    enabledModules: modules.filter(mod => mod.enabled).length, declaredModuleCodeFiles: declaredCodePaths.size,
    declaredModulePhysicalLines: sum([...declaredCodePaths].map(file => php.get(file) || {}), 'physicalLines'),
    declaredModuleLexicalCodeLines: sum([...declaredCodePaths].map(file => php.get(file) || {}), 'lexicalCodeLines'),
    staticHookNames: hookChains.length, staticHookDeclarations: sum(hookChains.map(chain => ({ length: chain.declarations.length })), 'length'),
    overriddenHookNames: hookChains.filter(chain => chain.declarations.length > 1).length,
    templateFiles: sourceFiles.filter(file => file.kind === 'template').length,
  },
  semanticsReview: features,
  boundaries: {
    httpEntryCandidates: sourceFiles.filter(file => file.path.endsWith('.php') && !file.path.includes('/')).map(file => file.path),
    sqlSources: sourceFiles.filter(file => file.path.endsWith('.sql')).map(file => file.path),
    database: ['include/db/db_mysqli.class.php', 'include/db/db_mysqli_error.inc.php'],
    protocol: ['command.php', 'include/global.func.php', 'include/javascript/game.20240718.js', 'include/javascript/replay.20231107.js', 'include/modules/extra/misc/replay/main.php'],
    moduleEngine: ['include/modules/modules.func.php', 'include/modules/modules.init.template.php', 'include/modulemng/modulemng.func.php'],
    templates: ['include/template.func.php', 'include/modulemng/modulemng.codeadv3.func.php'],
  },
  missingDeclaredCode: missingDeclarations,
  modules, hookChains, sourceFiles,
};
const serialized = JSON.stringify(inventory, null, 2) + '\n';
if (check) {
  if (await readFile(output, 'utf8') !== serialized) throw new Error('Native inventory is stale; run node scripts/native-inventory.mjs to regenerate it.');
} else {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, serialized);
}
console.log(JSON.stringify({ ...inventory.totals, migration: inventory.migration.counts, semanticsReview: features, missingDeclaredCode: missingDeclarations, checked: check }, null, 2));
