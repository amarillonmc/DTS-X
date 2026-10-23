// Generated from include/modules/base/metman/enemy_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write(" <table border=\"0\" cellspacing=\"0\" height=100px width=580px cellpadding=\"0\" width=\"100%\" valign=\"middle\">\r\n<tr>\r\n<td class=\"b1\" colspan=2 height=20px><span>Lv. ");
  await r.write(r.text(r.get(r.get(s, "tdata"), "lvl")));
  await r.write("</span></td>\t\t\t\t\t\t\t\t\t\t\t\r\n<td class=\"b1\" colspan=2><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "cardinfo")));
  await r.write(" ");
  await r.write(r.text(r.get(r.get(s, "tdata"), "name")));
  await r.write("</span></td>\t\t\t\t\t\t\t\t\t\t\t\r\n<td class=\"b1\" colspan=2><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "sNoinfo")));
  await r.write("</span></td>\t\t\t\t\t\t\t\t\t\t\t\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" width=70px height=20px><span>怒气</span></td>\r\n<td class=\"b3\" width=95px><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "ragestate")));
  await r.write("</span></td>\r\n<td class=\"b2\" width=70px><span>体力</span></td>\r\n<td class=\"b3\" width=105px><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "spstate")));
  await r.write("</span></td>\r\n<td class=\"b2\" width=70px><span>生命</span></td>\r\n<td class=\"b3\" width=170px><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "hpstate")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=20px><span>武器攻击</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "wepestate")));
  await r.write("</span></td>\r\n<td class=\"b2\"><span>武器种类</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "tdata"), "wepk")))));
  await r.write("</span></td>\r\n<td class=\"b2\"><span>武器</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "tdata"), "wep")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>");
  if (r.truth((await r.call("defined", "MOD_TACTIC")))) {
    (await r.include(r.template("MOD_TACTIC_ENEMY_TACTIC"), s));
  } else {
    await r.write("<td class=\"b2\"><span></span></td><td class=\"b3\"><span></span></td>");
  }
  if (r.truth((await r.call("defined", "MOD_POSE")))) {
    (await r.include(r.template("MOD_POSE_ENEMY_POSE"), s));
  } else {
    await r.write("<td class=\"b2\"><span></span></td><td class=\"b3\"><span></span></td>");
  }
  await r.write("<td height=\"20px\" class=\"b2\"><span>受伤部位</span></td>\r\n<td class=\"b3\"><span>");
  if (r.truth(r.get(r.get(s, "tdata"), "infdata"))) {
    await r.write(r.text(r.get(r.get(s, "tdata"), "infdata")));
  } else {
    await r.write("无");
  }
  await r.write("</span></td>\r\n</tr>\t\r\n<tr>\r\n<td class=\"b8\" height=\"20px\"></td><td class=\"b8\" height=\"20px\"></td>\r\n<td class=\"b8\" height=\"20px\"></td><td class=\"b8\" height=\"20px\"></td>");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_NPCSKILL_BUTTON"), s));
  } else {
    await r.write("<td class=\"b8\" height=\"20px\"></td><td class=\"b8\" height=\"20px\"></td>");
  }
  await r.write("</tr>\r\n</table>\r\n");
return 1;
}
