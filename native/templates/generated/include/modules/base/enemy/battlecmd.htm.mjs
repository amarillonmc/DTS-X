// Generated from include/modules/base/enemy/battlecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("现在想要做什么？<br><br>\r\n向对手大喊：<br><input size=\"30\" type=\"text\" name=\"message\" maxlength=\"60\"><br><br>");
  if (r.truth((r.truth((r.truth((await r.call("defined", "MOD_SKILL262"))) && r.truth((await r.module("skillbase", "skill_query", 262))))) && r.truth((await r.module("skill262", "check_unlocked262", r.get(s, "sdata"))))))) {
    (await r.include(r.template("MOD_SKILL262_SK262UI"), s));
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"combat\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"back\">");
  if (r.truth((!r.truth((await r.call("defined", "MOD_CLUBBASE")))))) {
    if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
      (await r.include(r.template("MOD_WEAPON_ATT_METHOD"), s));
    }
    await r.write("<br><input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]逃跑\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"> ");
  } else {
    if (r.truth((!r.truth(((r.get(r.get(s, "uip"), "blist") != null)))))) {
      r.assign(r.slot(s, ["uip", "blist"]), (await r.module("clubbase", "get_battle_skill_entry_array", r.get(s, "edata"))));
    }
    await r.write("<input type=\"hidden\" id=\"bskill\" name=\"bskill\" value=\"0\">\r\n<input type=\"hidden\" id=\"bskillpara\" name=\"bskillpara\" value=\"\">\r\n<table cellSpacing=0 cellPadding=0 width=300px style=\"table-layout:fixed;\">\r\n<tr><td width=100px align=\"center\" style=\"vertical-align:top\">");
    if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
      (await r.include(r.template("MOD_WEAPON_ATT_METHOD"), s));
    }
    await r.write("<br><input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]逃跑\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n</td>\r\n<td width=100px align=\"center\" style=\"vertical-align:top\">");
    if (r.truth((await r.call("is_array", r.get(r.get(s, "uip"), "blist"))))) {
      {
        const a0 = r.copy(r.get(r.get(s, "uip"), "blist"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), k0);
          r.assign(r.slot(s, ["bskill_disp"]), v0);
          if (r.truth((!r.truth(r.modulo(r.get(s, "i"), 2))))) {
            if (r.truth((r.compare(r.get(s, "i"), 1) > 0))) {
              await r.write("<span style=\"display:block;height:6px;\">&nbsp;</span>");
            }
            (await r.module("clubbase", "get_battle_skill_entry", r.get(s, "edata"), r.get(s, "i")));
          }
        }
      }
    }
    await r.write("</td>\r\n<td width=100px align=\"center\" style=\"vertical-align:top\">");
    if (r.truth((await r.call("is_array", r.get(r.get(s, "uip"), "blist"))))) {
      {
        const a1 = r.copy(r.get(r.get(s, "uip"), "blist"));
        for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["i"]), k1);
          r.assign(r.slot(s, ["bskill_disp"]), v1);
          if (r.truth(r.modulo(r.get(s, "i"), 2))) {
            if (r.truth((r.compare(r.get(s, "i"), 1) > 0))) {
              await r.write("<span style=\"display:block;height:6px;\">&nbsp;</span>");
            }
            (await r.module("clubbase", "get_battle_skill_entry", r.get(s, "edata"), r.get(s, "i")));
          }
        }
      }
    }
    await r.write("</td>\r\n</tr>\r\n</table>");
  }
  (await r.include(r.template("MOD_CLUBBASE_NPCSKILLPAGE"), s));
return 1;
}
