# 部署、迁移与运维

本地实现验收已完成，可作为 VPS 验证交付版。自动测试、真实主局与房间操作、全量编译和重启持久化已经通过；目标 VPS 的 Compose 部署、备份恢复和多人完整开战仍应先在隔离测试服验证。具体结果及 Windows 模板隔离的历史原因见 [VALIDATION.md](VALIDATION.md)。

## 完整包与依赖

必须携带 `engine/`、`runtime/`、`public/`、`scripts/`、`upstream/`、`server.mjs`、`package*.json`，以及 Docker 部署文件。本项目不引用工作区的相邻 `dts`、设定仓库或资源库；外部游戏原本引用的链接、论坛、远程音频和跨服服务仍依原配置工作。

可运行 `npm run bundle` 生成 `artifacts/dts-x-node.tar.gz`，复制到 VPS 后在新目录用 `tar -xzf dts-x-node.tar.gz` 解包。该包包含部署源码和锁定依赖清单，排除本机 `.env`、数据库、玩家存档和测试工具下载；首次部署仍需生成自己的配置。迁移已有服务器的数据另按下文备份恢复。

Docker 方案使用 Node 24 LTS 和 MariaDB 11.4.13，npm 依赖锁定在 `package-lock.json`。本地运行需要 Node ≥24.18.0（推荐受支持的 LTS）、npm 及 MariaDB。运行时确实内嵌 PHP，安装 npm 包会下载 WebAssembly；不需要本机 PHP。原生文件锁扩展用于不同执行线程间的文件锁，不可用时启动失败，不能降级成没有锁的多人服务。

建议先按 2 vCPU、2–4 GB RAM 的小服配置进行实测，再按玩家并发调整；这是起始配置，不是容量承诺。默认有 2 个外部执行线程、4 个内部线程、2 个 NPC 回调线程。每个实例的 PHP 内存上限为 512 MB，实际占用依模块和操作而变；不要盲目增加线程数。

## 首次安装

1. 生成 `.env`：`node scripts/configure.mjs --url=https://你的域名`。这一步不需要安装 npm 依赖，不覆盖已有配置。
2. 使用 `docker compose up -d --build`。默认只把应用端口绑定到 VPS 的 loopback；数据库不向宿主公开。
3. 查看 `docker compose logs -f app`。首次模块编译会耗时，健康检查留有十分钟启动窗口。初始化及编译失败的详细记录在应用持久卷的 `var/install.log`、`var/compile-validate.log`、`var/compile-compile.log`。
4. 使用 `.env` 中的 `ADMIN_USER` / `ADMIN_PASSWORD` 登录。主游戏的开始方式沿用原配置；站长可从原管理页面开局，玩家也可使用原房间功能。
5. 域名反向代理至 `http://127.0.0.1:3000`，为外网部署配置 HTTPS。游戏目前要求部署在域名根路径，不支持 `/dts/` 这样的子路径。

如 VPS 没有 Node，可在另一台机器生成 `.env` 后一起上传，或在 Linux 通过 `docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" -w /work node:24-bookworm-slim node scripts/configure.mjs --url=https://你的域名` 生成。指定宿主用户可避免生成只有 root 可读的配置文件。

非 Docker：事先创建专用空库与数据库用户，把连接信息写入 `.env`，执行 `npm ci`、`npm run setup`、`npm start`。应用不会替你创建数据库，也不会清空非空数据库。可用 systemd 管理 `npm start`，不用运行 `acdts-daemonctl.sh` 或 `.bat`。

## 单层反向代理与玩家 IP

`TRUST_PROXY` 默认 `0`，只使用 TCP 连接对端地址。若在同机 nginx 后运行，默认地址会是代理或 Docker 网关，影响原游戏按 IP 记录及限制账号的行为。只有在应用端口不向外网开放、请求必经自己控制的单层反代时，才在 `.env` 设置 `TRUST_PROXY=1`，并保持 Compose 的 `BIND_ADDRESS=127.0.0.1`；非 Docker 的 `HOST` 同样保持 `127.0.0.1`。

在已配置域名与 HTTPS 证书的 nginx `server` 内加入以下代理段，`PUBLIC_URL` 填同一个外部 HTTPS 地址：

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

必须用 `$remote_addr` **覆盖** `X-Forwarded-For`，不要使用会累加客户端值的 `$proxy_add_x_forwarded_for`。Node 仅接受该头中的单个合法 IPv4/IPv6，非法值、多值或缺失值回退到连接对端；原始 `X-Forwarded-For`、`Client-IP` 和 `CF-Connecting-IP` 会在进入 PHP 前移除，防止旧 `real_ip()` 再次无条件信任它们。直接开放 `BIND_ADDRESS=0.0.0.0` 时必须保持 `TRUST_PROXY=0`。此配置不适用于未经单独验证的 CDN 或多层代理链。

Node 向 PHP 提供正确的 IPv6 `REMOTE_ADDR`，但上游 `real_ip()` 只提取 IPv4，原 IP 记录/限制因此仍有 IPv6 局限；本移植未改变其游戏侧解析规则。`client_max_body_size` 应与 `MAX_BODY_MB` 保持一致。

## 状态和配置

- `.env`：连接信息、公开地址、初始站长账号和线程数。安装后修改 `ADMIN_PASSWORD` 不会重置数据库中的密码；改密码使用游戏原有流程。
- `var/game/`：实际运行目录，包含配置、资源快照、编译代码、日志、临时锁、录像和生成文件。
- `var/php/`：PHP 会话和临时文件。
- MariaDB：账号、人物、房间、战绩等原数据表。表引擎与字符集保留原版，不擅自转换。

Docker 将应用的 `var` 和数据库分别放在 `game-state`、`database` 命名卷中。源目录的 `engine/` 不是服务器存档。复制仓库只会部署新服，迁移现有服必须同时迁移数据库和持久化目录。

初始管理员密码必须为 12–24 个字符，与原版登录和改密限制相容；生成器使用随机 24 位十六进制密码。`MAX_BODY_MB` 默认 64，同时设置 Node 请求体限制及 PHP 上传限制，供原跨服录像上传使用；反向代理也要允许所需请求大小。`DATA_DIR` 默认 `var`，必须与 `engine/` 分开，不能指向项目根或其父目录；迁移到另一台机器时不要沿用旧机器的绝对路径。

应用以容器内 `node` 用户（UID/GID 1000）运行。首次命名卷会继承镜像中的目录所有者；恢复备份或改用 bind mount 后，需停服校正状态目录权限。对于本项目 Compose 命名卷，可执行 `docker compose run --rm --no-deps --user root --entrypoint chown app -R 1000:1000 /app/var`，然后正常启动。此命令只针对应用状态卷，不修改数据库卷。

`GET /healthz` 表示应用启动和编译完成。深度数据库诊断使用 `docker compose exec app npm run doctor` 或本地 `npm run doctor`。健康接口不输出密码、绝对路径或管理信息。

## 停服备份与恢复

原 SQL 含 MyISAM 表，不能依赖 `--single-transaction` 做一致性备份。先停止应用，再导出数据库和整个状态目录：

```sh
set -eu
umask 077
backup_dir="backup/$(date -u +%Y%m%dT%H%M%SZ)"
test ! -e "$backup_dir"
mkdir -p "$backup_dir"
docker compose stop app
docker compose exec -T db sh -c 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --databases "$MARIADB_DATABASE" --lock-all-tables' > "$backup_dir/database.sql"
docker compose cp app:/app/var "$backup_dir/state"
cp .env "$backup_dir/config.env"
docker compose start app
```

每次备份写入新的时间戳目录，避免覆盖上次备份或把 `var` 嵌套复制进旧 `state`。任何步骤失败便停止；检查错误并完成备份后，再手工启动应用。保管好备份中的凭据和玩家数据。在新 VPS 使用同版本代码与数据库，先启动数据库服务，再通过 `mariadb` 导入 dump，把备份状态复制回应用卷的 `/app/var` 后再启动 app。务必核对 `DB_NAME`、`TABLE_PREFIX`、文件所有者和 `gamedata/install.lock`；不要让自动首次安装运行在已有数据上。实际恢复前可先在隔离实例演练。

以下是将上述 DTS-X 备份恢复到全新 Compose 卷的顺序。先把所选备份中的 `config.env` 放回 `.env`，只调整 `PUBLIC_URL` 等目标机器设置，保留数据库名、表前缀和凭据的一致性。将示例 `backup_dir` 替换为实际备份目录后执行：

```sh
set -eu
backup_dir=backup/20261022T183000Z
test -f "$backup_dir/state/game/gamedata/install.lock"
docker compose up -d --wait db
docker compose build app
docker compose create app
docker compose exec -T db sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD"' < "$backup_dir/database.sql"
docker compose cp "$backup_dir/state/." app:/app/var
docker compose run --rm --no-deps --user root --entrypoint chown app -R 1000:1000 /app/var
docker compose up -d app
docker compose exec app npm run doctor
```

导入失败就停止恢复，不要启动应用或反复运行安装器。这个流程针对完整 DTS-X 备份；旧 PHP 服的目录不是这样的备份，不能直接覆盖 `var/game` 后假定迁移完成。旧服导入还需确认其源码版本、配置与模块差异、数据库表前缀及录像中的历史绝对路径，先在隔离副本逐项迁移验证。本项目未提供未经验证的一键旧服导入器。

## 更新和故障处理

更新前备份并停服。修改源 `engine/` 后重建 app 镜像；启动时同步发生变动的源文件到持久目录，并按需重新编译。没变动的源文件不会覆盖运行目录内旧管理页面保存的设置。如果源与运行副本都改变，启动会报告具体冲突并在同步前停止：备份两个副本，合并改动，使运行副本与最终源内容一致后重试。源删除只会删除未被单独修改的对应副本。不要删除 `source-state.json` 绕过冲突，它记录了同步依据。

`npm run setup` 可重复执行：已有安装锁时不重建数据库，编译输入未改变且缓存完整时不重复编译。编译结束后，Node 根据原模板解析器生成的清单逐项检查宿主磁盘上的非空模板文件，全部存在才保存成功标记；每次启动也会复核清单，发现丢失或空文件便重新编译。编译开始即撤销旧成功标记；失败后修复错误再运行 `npm run compile`，不能通过恢复旧标记来使用部分生成的缓存。首次安装若中途失败并留下非空库，安装器会拒绝再次写入；查看 `install.log`，确认是否为新建空服后，恢复安装前的空库备份或使用新的专用空库。不要清空已有玩家数据的库。

如果编译输出成功而模板文件随后消失，先检查宿主安全软件的隔离记录及文件系统日志，不要持续重编译或恢复旧成功标记。本次 Windows 验证已确认火绒隔离原引擎生成的 PHP 模板。信任目录或恢复隔离文件应由主机管理员根据实际记录决定；也可转到独立 Linux 测试环境继续验收。应用本身不会修改防护设置。

禁止把多个 app 副本指向同一存档进行横向扩容。服务器、setup 与 compile 使用同一个 OS 状态锁，并发运行会直接报错；停止持有锁的进程后再重试，不要删除锁文件。进程退出后锁由 OS 释放，不需要手工清理“旧锁”。该版本保留原文件锁和游戏全局状态，部署约定是单个 Node 主机、多个内部执行线程。后台维护由 Node 的定时器触发，仍沿用原维护的节流和业务逻辑。

本次环境没有 Docker，Compose 的实际构建、Linux 文件锁与备份恢复演练尚未完成。Windows 上已验证真实 MariaDB 与嵌入 PHP 的安装、全量编译、独立进程状态锁、实际游戏操作及重启前后数据一致；测试父进程通过 IPC 进入相同生产 shutdown 逻辑并正常退出，这不等同于 Linux 的 SIGTERM 验收。生产上线前应在目标 VPS 执行首次启动、停服备份和隔离恢复演练。
