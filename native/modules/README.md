# 原生模块分派

`registry.mjs` 直接执行 JavaScript 模块；不加载 PHP、WASM，不解释或转换 PHP 源码。它对应上游 `modules.func.php` 的分派和变量共享机制。全部原模块通过原生宿主组成完整游戏，模块本身不负责启动 HTTP。

```js
const registry = new ModuleRegistry([
  {
    name: 'base',
    state: () => ({ count: 0 }),
    functions: {
      async damage(ctx, attacker, defender) {
        ctx.state().count++;
        return attacker.attack;
      },
    },
  },
  {
    name: 'bonus',
    dependencies: ['base'],
    functions: {
      async damage(ctx, attacker, defender) {
        return (await ctx.next(attacker, defender)) * 2;
      },
    },
  },
]);
const session = await registry.createSession({ services: {} });
const amount = await session.call('base', 'damage', attacker, defender);
```

模块声明保留真实 `dependencies`、`optionalDependencies`、`conflicts`。缺失依赖、循环依赖、重复模块及未经依赖声明的同名函数覆盖都会报错。`enabled: false` 的模块不参与注册。排序使用原检查器的 FIFO 队列：清单中最先出现的零入度模块先入队，其余模块在所有依赖完成后入队；已启用的可选依赖也影响顺序。

每次 `createSession()` 创建独立模块状态，按排序依次执行 `initialize(ctx)`，随后注册本模块函数和公开变量。`state` 可是返回数据对象的工厂，或默认数据对象；默认值及 `states` 注入值均以 `structuredClone()` 深复制，再按模块名覆盖实例初始字段，避免共用配置污染其他请求。请求数据和配置经 `states` 注入；数据库连接、函数及需要保留身份的服务经 `services` 注入。字段间的 getter/setter 别名应在 `initialize` 中建立。不能把请求状态写入进程级全局变量。

`ctx.call(module, function, ...args)` 表示原函数体中的直接函数调用；`ctx.next(...args)` 表示 `$chprocess(...)`。调用任意模块的同名函数，通常会进入最后注册的一层；只有调用者恰为下一层覆盖函数时，才直接进入指定层。因此 `ctx.next()`、从第三层直接点名第一层、以及第一层递归调用自身的行为不同。链底 `next()` 返回 `null`。函数名和 namespace 大小写不敏感。缺失函数直接报错。

所有可能覆盖的调用都应 `await`。直接调用某个 descriptor 内的 JavaScript 函数会绕过分派，仅可用于有意隔离的测试。`ctx.call()` 保留当前函数的调用者身份，不要将它传给不代表直接模块调用的服务回调；真正外部入口应使用 `session.call()`。

`ctx.state(name)` 返回该模块的共享状态，省略名字取当前模块；`ctx.hasModule(name)` 对应已完成初始化的 `MOD_*`。`ctx.importInto(scope, ...names)` 以 getter/setter 建立引用别名，后导入模块可覆盖同名变量；`input` 仅覆盖尚未设置或为 `null` 的变量。公开变量名在初始化完成时捕获，`___PRIVATE_` 前缀不导出。原 `IMPORT_WITH` 可以通过显式命名对象替代，不需要运行字符串代码。

原 ADV 编译在缓存初始化时限制除 `sys`、`player` 外的模块导入 `sys` / `input`。原生实现按请求初始化，不生成 ADV 初始化缓存，因此没有照搬这条仅针对该缓存过程的约束；这不是对原 PHP 编译器全部合法性规则的复刻。`state()` 也提供显式访问模块状态的原生 API，不模拟 PHP 的变量名隔离。

原引用参数的对象沿调用链保留同一个对象；标量引用用 `reference(object, key)` 或 `ctx.reference(module, key)` 创建的 `{ value }` 槽。例如 `wep_b_clean_arrow_sk` 接收这样的槽。原按值参数需要在函数边界显式复制数据；本注册器不会猜测任意 JavaScript 对象是否对应 PHP 数组，也不会把所有对象参数偷偷改为值传递。

验证命令：`node --test tests/native-modules.test.mjs tests/native-weapon-kinds.test.mjs`。PHP 7.4 仅作为开发差分基准，缺少时相应测试明确跳过。原生运行模块没有 PHP 依赖。这两项测试覆盖分派、递归、引用、初始化及限定的武器分支；完整数据库、模板、整局和浏览器的独立验证见 doc/NATIVE-MIGRATION.md。
