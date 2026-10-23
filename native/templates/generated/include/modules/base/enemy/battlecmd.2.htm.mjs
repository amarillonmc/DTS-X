// Generated from include/modules/base/enemy/battlecmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"combat\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"back\">");
  if (r.truth((r.truth((r.truth((await r.call("defined", "MOD_SKILL262"))) && r.truth((await r.module("skillbase", "skill_query", 262))))) && r.truth((await r.module("skill262", "check_unlocked262", r.get(s, "sdata"))))))) {
    await r.write("<div class=\"cmd_row\">");
    (await r.include(r.template("MOD_SKILL262_SK262UI"), s));
    await r.write("</div>");
  }
  await r.write("<div class=\"cmd_row\">\r\n<div class=\"inputhint_container\" style=\"width:336px;\">\r\n<div class=\"inputhint\">向对手大喊</div>\r\n<input type=\"text\" name=\"message\" maxlength=\"60\" onfocus=\"inputhint_onfocus(this)\" onblur=\"inputhint_onblur(this)\">\r\n</div>\r\n</div><div class=\"cmd_row\">");
  if (r.truth((await r.call("defined", "MOD_DUALWEP")))) {
    r.assign(r.slot(s, ["secattmethod"]), (await r.module("dualwep", "get_sec_attack_method", r.get(s, "sdata"))));
  } else {
    r.assign(r.slot(s, ["secattmethod"]), "");
  }
  if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
    (await r.include(r.template("MOD_WEAPON_ATT_METHOD"), s));
  }
  await r.write("<div class=\"cmd_positioner ");
  if (r.truth(r.get(s, "secattmethod"))) {
    await r.write("common_cmd");
  } else {
    await r.write("explore_cmd");
  }
  await r.write("\" style=\"height:50px\">\r\n<input type=\"button\" class=\"cmd_button ");
  if (r.truth(r.get(s, "secattmethod"))) {
    await r.write("common_cmd");
  } else {
    await r.write("explore_cmd");
  }
  await r.write(" glow_buttons red b\" style=\"height:50px;font-size:12pt;\" id=\"x\" value=\"逃跑\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    await r.write("<input type=\"hidden\" id=\"bskill\" name=\"bskill\" value=\"0\">\r\n<input type=\"hidden\" id=\"bskillpara\" name=\"bskillpara\" value=\"\">\r\n<div class=\"cmd_row\">");
    (await r.module("clubbase", "get_battle_skill_entry", r.get(s, "edata"), 1));
    (await r.module("clubbase", "get_battle_skill_entry", r.get(s, "edata"), 2));
    (await r.module("clubbase", "get_battle_skill_entry", r.get(s, "edata"), 3));
    await r.write("</div>");
  }
  if (r.truth((await r.call("defined", "MOD_CLUBBASE_NPCSKILLPAGE")))) {
    (await r.include(r.template("MOD_CLUBBASE_NPCSKILLPAGE"), s));
  }
  r.assign(r.slot(s, ["uip", "display", "log_height"]), 205);
return 1;
}
