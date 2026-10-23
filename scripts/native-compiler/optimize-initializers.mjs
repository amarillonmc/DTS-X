/** Remove only an entirely unused top context immediately followed by init.
 * init still constructs its own context before any side effect, publishes its
 * generated-module identity, and runs exactly once in the original order. */
export function optimizeInitializers(source) {
  return source.replace(/(  async initialize\(ctx\) \{\n)    const r = createModuleContext\(ctx, "[a-z_][a-z0-9_]*", 'top'\), s = ctx\.state\(\);\n(    await init\(ctx\);\n  \},)/g, '$1$2');
}
