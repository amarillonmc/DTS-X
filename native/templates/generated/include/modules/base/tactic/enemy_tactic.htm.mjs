// Generated from include/modules/base/tactic/enemy_tactic.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "tactic");
  await r.write("<td class=\"b2\" height=20px><span>应战策略</span></td>\r\n<td class=\"b3\"><span>");
  if (r.truth(((r.get(r.get(s, "tacinfo"), r.get(r.get(s, "tdata"), "tactic")) != null)))) {
    await r.write(r.text(r.get(r.get(s, "tacinfo"), r.get(r.get(s, "tdata"), "tactic"))));
  } else {
    await r.write(r.text(r.get(r.get(s, "tdata"), "tactic")));
  }
  await r.write("</span></td>\r\n");
return 1;
}
