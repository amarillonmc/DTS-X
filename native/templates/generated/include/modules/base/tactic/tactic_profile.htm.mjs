// Generated from include/modules/base/tactic/tactic_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "tactic");
  await r.write("<td class=\"b2\" height=\"20\"><span>应战策略</span></td>\r\n<td class=\"b3\" height=\"20\"><span>");
  await r.write(r.text(r.get(r.get(s, "tacinfo"), r.get(s, "tactic"))));
  await r.write("</span></td>");
return 1;
}
