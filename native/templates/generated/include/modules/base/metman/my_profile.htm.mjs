// Generated from include/modules/base/metman/my_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table border=\"0\" width=580px height=80px cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<tr>\r\n<td class=\"b1\" colspan=2 height=20px><span>");
  await r.write(r.text(r.get(r.get(s, "typeinfo"), r.get(s, "type"))));
  await r.write("(");
  await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
  await r.write(r.text(r.get(s, "sNo")));
  await r.write("号)</span></td>\r\n<td class=\"b1\" colspan=2><span>");
  await r.write(r.text(r.get(s, "name")));
  await r.write("</span></td>\r\n<td class=\"b1\" colspan=2><span>Lv. ");
  await r.write(r.text(r.get(s, "lvl")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" width=70px height=20px><span>生命</span></td>\r\n<td class=\"b3\" width=170px><span><span class=\"");
  await r.write(r.text(r.get(s, "hpcolor")));
  await r.write("\">");
  await r.write(r.text(r.get(s, "hp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "mhp")));
  await r.write("</span></span></td>\r\n<td class=\"b2\" width=70px><span>体力</span></td>\r\n<td class=\"b3\" width=105px><span>");
  await r.write(r.text(r.get(s, "sp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "msp")));
  await r.write("</span></td>\r\n<td class=\"b2\" width=70px><span>怒气</span></td>\r\n<td class=\"b3\" width=95px><span>");
  if (r.truth((r.compare(r.get(s, "rage"), 30) >= 0))) {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "rage")));
    await r.write("</span>");
  } else {
    await r.write(r.text(r.get(s, "rage")));
  }
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=20px><span>武器</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "wep")));
  await r.write("</span></td>\r\n<td class=\"b2\"><span>武器种类</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(s, "wepk")))));
  await r.write("</span></td>\r\n<td class=\"b2\"><span>武器攻击</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "wepe")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>");
  if (r.truth((await r.call("defined", "MOD_WOUND")))) {
    (await r.include(r.template("MOD_WOUND_WOUND_PROFILE_BATTLE"), s));
  } else {
    await r.write("<td class=\"b2\"><span></span></td><td class=\"b3\"><span></span></td>");
  }
  if (r.truth((await r.call("defined", "MOD_POSE")))) {
    (await r.include(r.template("MOD_POSE_POSE_PROFILE"), s));
  } else {
    await r.write("<td class=\"b2\"><span></span></td><td class=\"b3\"><span></span></td>");
  }
  if (r.truth((await r.call("defined", "MOD_TACTIC")))) {
    (await r.include(r.template("MOD_TACTIC_TACTIC_PROFILE"), s));
  } else {
    await r.write("<td class=\"b2\"><span></span></td><td class=\"b3\"><span></span></td>");
  }
  await r.write("</tr>\r\n</table>");
return 1;
}
