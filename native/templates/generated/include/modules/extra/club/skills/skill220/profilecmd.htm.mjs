// Generated from include/modules/extra/club/skills/skill220/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--这个文件不能在修改的这次更新直接删除（否则文件修改时间没法判定，也就没法刷新模板）。等下一次更新删除-->");
return 1;
}
