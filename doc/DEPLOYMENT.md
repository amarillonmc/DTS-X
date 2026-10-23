# 原生 Node.js 部署与运维

`XX` 分支的生产入口位于 `native/`。`npm start`、`npm run setup`、`npm run compile`、`npm run doctor` 使用原生 JavaScript、mysql2 和操作系统文件锁，不运行 PHP、PHP WebAssembly 或原 PHP daemon。PHP/WASM 留在开发依赖和旧版回归中；生产安装使用 `npm ci --omit=dev`。

原始资源和对照源码仍在 `engine/`，来源见 `upstream/manifest.json`。经典界面、请求协议及资源路径保留。原生测试覆盖情况见 [NATIVE-MIGRATION.md](NATIVE-MIGRATION.md)，旧兼容版的历史验收不能作为本版的验收。**本次没有实际运行 Docker/Compose；下述容器流程仍需在目标主机演练。**

## 首次安装

需要 Node.js ≥24.18.0、npm、可用的原生 OS 文件锁扩展，以及专用 MySQL/MariaDB 数据库。数据库须支持原表使用的 MyISAM、MEMORY/HEAP 和 InnoDB；不要自行把所有表转换成一种引擎。

1. 用 `node scripts/configure.mjs --url=https://你的域名` 生成私有 `.env`。生成器不会覆盖已有文件。配置 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD` 和 `TABLE_PREFIX`；非 Docker 部署需先建立专用空库和相应数据库用户。
2. 确认 `NATIVE_DATA_DIR` 指向独立、空的私有目录。未设置时为 `DATA_DIR/native`；`DATA_DIR` 默认 `var`，因此默认是项目下的 `var/native/`。不能放在 `engine/`、`public/` 或项目根目录中。
3. 执行 `npm ci --omit=dev`，再执行 `npm run setup`。安装器创建原始表结构、主局记录和初始管理员；它不创建数据库，也不清空数据库。
4. 执行 `npm run compile` 和 `npm run doctor`，确认静态模块、模板、安装归属、数据库与 OS 锁可用，再运行 `npm start`。
5. 使用 `.env` 的 `ADMIN_USER` / `ADMIN_PASSWORD` 登录。初始密码建议使用生成器的 24 位随机值，并保持在原界面接受的 12–24 字符范围内。安装后修改 `ADMIN_PASSWORD` 不会修改已存密码；改密使用账户页面。

`AUTO_SETUP=1` 允许启动时执行同一个安装检查。新实例必须同时满足空库、空状态目录；已有实例只有归属验证通过才继续启动。首次安装中断时保留 `creating` 日志和已创建数据，之后拒绝重新初始化；不要删除安装标记或清空数据库来重试。先检查失败原因，或使用另一套明确的空库和空目录重新部署。

安装归属由两个位置共同证明：状态目录的 `native-install.json`，以及数据库的 `<TABLE_PREFIX>native_install` 表。两者的 `owner` 必须一致，数据库名、表前缀、必需表及主局记录也必须匹配。仅复制其中一方、手工伪造标记或把旧服数据库直接交给安装器都会被拒绝。

部署包必须包含 `native/`、`engine/`、`public/`、`upstream/`、`scripts/`、`package.json` 与 lockfile，以及所用的部署文件。`npm run bundle` 生成源码发布包；包内不应包含 `.env`、玩家状态、数据库文件、`node_modules` 或本机测试下载。安装依赖时保持 lockfile，不通过重新解析版本修复线上问题。

## 配置、权限与公开入口

| 配置 | 用途 |
| --- | --- |
| `PUBLIC_URL` | 外部可访问的 HTTP/HTTPS origin，例如 `https://dts.example.com`。只支持域名根路径。 |
| `HOST` / `PORT` | Node 监听地址与端口，默认 `127.0.0.1:3000`。 |
| `NATIVE_DATA_DIR` | 本实例全部可变文件的私有根目录。 |
| `MAX_BODY_MB` | 请求体上限，默认 64 MiB；反代上限应与之相符。 |
| `NATIVE_TICK_MS` | 原生后台调度间隔，默认 1000 ms；不会改变原玩法中的时间条件。 |
| `TRUST_PROXY` | 默认 `0`；只在受控单层反代后设置为 `1`。 |

`native-admin-config.json` 保存管理页面设置；`native-module-state.json` 保存活动模块清单、编辑候选和已验证候选。其余可变内容位于该根目录的 `gamedata/`，包含录像、缓存、日志、房间通知和备份。`.native-locks/` 是真实 OS 锁的稳定文件载体。数据库保存账户、人物、房间、战绩和活动排行。源目录 `engine/` 不是存档，也不会在每次启动时复制成第二份 PHP 运行树。

状态目录只授权给运行 Node 的系统账户。POSIX 目录建议 `0700`、私有文件 `0600`；Windows 使用相应 ACL 限制访问。`.env`、安装标记、账户备份和跨服密钥都不能放进静态资源目录或公开下载。原生文件服务拒绝逃逸路径及符号链接，不把私有目录作为一般 HTTP 文档根目录。

`/healthz` 用于进程就绪检查；它不代替数据库诊断或玩法回归。`npm run doctor` 验证归属、必需表、主局、模块/模板和锁支持，报告不包含凭据；除私有锁探测文件外不写业务数据。公开网页安装器 `install_NEW.php` 不启用。

`game.php`、`command.php`、`map.php` 等 URL 是保留的原协议入口，由 `native/http/` 的 Node 控制器处理；链接中的 `.php` 不表示服务器执行 PHP。反向代理应将这些请求原样交给 Node。`doctor` 通过也不代表浏览器点击、下拉框或每个教程步骤已经验收。

## 反向代理与跨服回调

应用端口只绑定回环地址，在受控 nginx `server` 中可使用：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_http_version 1.1;
    proxy_read_timeout 60s;
    client_max_body_size 64m;
}
```

只有请求必经自己的单层代理、应用端口未对外开放的部署，才启用 `TRUST_PROXY=1`。必须覆盖 `X-Forwarded-For`，不能累加客户端传入值。Node 只接受一个有效地址；其余代理头不会再次交给游戏无条件信任。直接开放监听时保持 `TRUST_PROXY=0`。多层 CDN/代理需要另行验证。原账户 IP 处理保留上游 IPv4 限制。

跨服用户库、活动排行和录像使用真实 HTTP 请求。`PUBLIC_URL` / 游戏地址须从对方服务器可达；录像远端收到 `storage_req` 后会反向访问本服 `/replay_receive.php` 取回原录像容器。不要把仅容器内可达的主机名写成公开回调地址。检查 DNS、TLS、入站/出站防火墙、反代请求大小与超时；单机能打开首页不证明跨服回调可达。

接收授权必须由操作员显式写入状态根目录。默认不启用原源码中公开的示例密钥。安装完成后，再创建以下私有文件；修改后重启服务：

`native-userdb-peers.json`，同时用于远程用户库与活动排行认证：

```json
{"version":1,"peers":{"other-server":{"pass":"替换为独立随机密钥","ip":"203.0.113.10"}}}
```

`ip` 为对方服务器实际请求地址，支持精确 IPv4；空字符串不限制来源 IP，仍须通过密钥与时间签名。用户库协议能查询和修改账户数据，只授权受信任的服务器。各主机时钟须同步。

`native-replay-peers.json`，用于授权录像存储请求：

```json
{"version":1,"peers":{"other-server":"替换为另一独立随机密钥"}}
```

录像 `sign` 也是私有目录名，不能包含路径分隔符、冒号或目录逃逸语法。发送端的原配置字段为 `userdb_remote_storage` / `userdb_remote_storage_sign` / `userdb_remote_storage_pass`，以及 `replay_remote_storage` / `replay_remote_storage_sign` / `replay_remote_storage_key`；通过原生管理设置配置，不能只编辑原 PHP 样例文件。接收端授权文件与发送端设置是两个独立方向，不会自动互相授权。

## Docker 与进程管理

`Dockerfile` 使用原生入口和生产依赖；Compose 提供应用与 MariaDB 服务。先检查 `.env`，再使用 `docker compose up -d --build`。Compose 默认仅向宿主回环地址发布应用端口，数据库不发布到宿主；`game-state` 卷挂载 `/app/var`，默认原生状态在 `/app/var/native`，数据库使用独立 `database` 卷。首次健康检查的宽限期不是编译或容量承诺。

应用以容器中的 `node` 用户运行。bind mount 或备份恢复后需确认 UID/GID 和目录权限；示例镜像使用 UID/GID 1000。只对已核对的应用状态目录修正权限，不修改数据库卷。非容器部署可由 systemd 或其他服务管理器管理 `npm start`，不运行旧 shell/bat PHP daemon。

一个原生状态目录只允许一个服务进程。`start`、离线 `setup` 与 `compile` 共用 `native-process-owner` OS 锁；锁不可用或被其他进程持有就失败。不要删除锁文件，也不要将多个 app 副本指向同一数据库和存档做横向扩容。该部署模型未验收分布式文件系统和多主写入。

`SIGINT` / `SIGTERM` 触发停止调度、停止接收新动态请求、等待进行中的请求及远端账户锁释放，最后关闭数据库与实例锁。HTTP 有关闭超时，操作系统崩溃仍不等于有序完成业务；备份应等待应用真正退出。原生锁由 OS 随进程退出释放持有权，不需要删除所谓“旧锁”。

## 备份与同版本恢复

完整备份包括**数据库、整个 `NATIVE_DATA_DIR` 和 `.env`**。原表含 MyISAM，不能仅依赖 `--single-transaction`；先停服，再导出并复制文件。管理页用户表备份和每日用户备份只保存账户表，不能恢复人物、房间、全局进度或录像，不能替代完整备份。

以下 Compose 示例仅适用于默认状态路径。使用自定义 `NATIVE_DATA_DIR` 时先核对容器内对应路径，再替换复制命令：

```sh
set -eu
umask 077
backup_dir="backup/$(date -u +%Y%m%dT%H%M%SZ)"
test ! -e "$backup_dir"
mkdir -p "$backup_dir"
docker compose stop app
docker compose exec -T db sh -c 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --databases "$MARIADB_DATABASE" --lock-all-tables' > "$backup_dir/database.sql"
docker compose cp app:/app/var/native "$backup_dir/native"
cp .env "$backup_dir/config.env"
docker compose start app
```

任一步失败都应先查清原因，不覆盖上一份备份。备份含账号哈希、跨服密钥与数据库密码，按私有数据保存。不要把备份目录提交到版本库或放到网页目录。

恢复必须针对隔离的空目标，使用匹配的代码版本和数据库名称/表前缀。先启动数据库而不启动应用，导入完整 dump，再恢复整个原生状态目录和 `.env`，检查文件权限。`native-install.json` 与 `<TABLE_PREFIX>native_install` 必须来自同一次备份且归属一致。确认后先运行 `npm run doctor`，再启动应用并核对账号、主局、房间、录像和再次重启。数据库改名、拆分备份或只恢复用户表都不是自动支持的完整实例恢复。

## 旧 PHP/WASM 服迁移与更新

原生安装器**不认领旧服非空数据库，也不自动导入或清空旧服**。旧版 `var/game` / `var/php` 不是原生状态目录，不能改名为 `var/native` 假装完成迁移。当前没有经验证的一键全服导入命令。

先保留旧服数据库、完整持久目录、`.env` 和代码版本备份。在局间安排切换窗口，使用独立的新原生数据库和状态路径验证账号、配置、模块差异、历史录像与其他数据的迁移方案；保留旧实例的完整回退副本。未完成该实例的数据核对前，不把玩家流量切到新服。不要为绕过安装保护而复制或修改 owner 标记。

正常原生更新先备份、停服、替换代码并按 lockfile 安装依赖，然后运行 `npm run compile`、`npm run doctor`，再启动。`compile` 只验证已交付的原生模块和静态模板，不重新执行 PHP 编译器，也不重生覆盖 JavaScript。管理页面保存并通过检查的候选可在停服后用 `npm run compile -- --staged` 应用；没有有效候选或构建指纹变化就拒绝。更改 JavaScript 实现后需要重启 Node。

更新现代界面脚本后，在浏览器用 Ctrl+F5 强制刷新；若自行配置了代理或 CDN 静态资源缓存，也需刷新对应的 `/modern/modern.js` 缓存。2026-10-23 的教学疗伤与移动下拉框修复不需要数据库迁移：保留现有 `.env`、数据库与状态目录，更新代码、停服校验、重启即可，已保存的教程进度可继续使用。

同日的合成提交 500 修复位于 `native/gameplay/base-extra/itemmix.mjs`，教学与普通游戏共用。每次请求的界面临时状态从空值开始，原生实现现按原 PHP 行为在首次写入时建立该状态，并允许读取尚不存在的合成选项。更新后停服运行 `npm run compile`、`npm run doctor` 并重启 Node；无需清空数据库、重开教学或调整反代设置。回归时既检查“道具合成”入口，也要实际选择材料并提交。

默认开发修改 `native/`。部分规则、页面和模板是由开发期工具生成的静态 JavaScript；运行 `scripts/native-compiler/build-*.mjs` 会覆盖相应生成文件，不能当作日常启动/编译步骤。维护方式见 [ARCHITECTURE.md](ARCHITECTURE.md) 与 [DEVELOPMENT.md](DEVELOPMENT.md)。

上线前仍需在目标环境验证首次安装、非空库保护、重复启动、反代 IP、跨服回调、SIGTERM、完整备份和隔离恢复。当前真实 MySQL、OS 锁、原生 HTTP 和原 PHP 差分测试的结果，不能替代未执行的 Docker、Linux 或目标并发容量验收。
