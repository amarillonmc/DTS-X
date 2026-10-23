// Generated from include/modules/extra/club/skills/skill248/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill248");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 248);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n天助\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span style=\"margin-top:8px; margin-bottom:6px; display:block;\">");
  r.assign(r.slot(s, ["clv1"]), r.int((await r.module("skillbase", "skill_getvalue", 248, "lvl1"))));
  r.assign(r.slot(s, ["clv2"]), r.int((await r.module("skillbase", "skill_getvalue", 248, "lvl2"))));
  r.assign(r.slot(s, ["clv3"]), r.int((await r.module("skillbase", "skill_getvalue", 248, "lvl3"))));
  r.assign(r.slot(s, ["v1"]), (await r.module("skill248", "calculate_skill248_hide_gain", r.get(s, "clv1"))));
  r.assign(r.slot(s, ["v2"]), (await r.module("skill248", "calculate_skill248_obbs_gain", r.get(s, "clv1"))));
  r.assign(r.slot(s, ["v3"]), (await r.module("skill248", "calculate_skill248_dodge_gain", r.get(s, "clv2"))));
  r.assign(r.slot(s, ["v4"]), (await r.module("skill248", "calculate_skill248_dodge_r_gain", r.get(s, "clv2"))));
  r.assign(r.slot(s, ["v5"]), (await r.module("skill248", "calculate_skill248_counter_gain", r.get(s, "clv2"))));
  r.assign(r.slot(s, ["v6"]), (await r.module("skill248", "calculate_skill248_hitrate_gain", r.get(s, "clv3"))));
  r.assign(r.slot(s, ["v7"]), (await r.module("skill248", "calculate_skill248_hitrate_r_gain", r.get(s, "clv3"))));
  if (r.truth(r.equal(r.get(s, "clv1"), 0))) {
    r.assign(r.slot(s, ["cl1"]), "grey b");
  } else {
    if (r.truth((r.compare(r.get(s, "clv1"), 3) <= 0))) {
      r.assign(r.slot(s, ["cl1"]), "white");
    } else {
      if (r.truth((r.compare(r.get(s, "clv1"), 9) <= 0))) {
        r.assign(r.slot(s, ["cl1"]), "yellow b");
      } else {
        if (r.truth((r.compare(r.get(s, "clv1"), 15) <= 0))) {
          r.assign(r.slot(s, ["cl1"]), "orange");
        } else {
          r.assign(r.slot(s, ["cl1"]), "red b");
        }
      }
    }
  }
  if (r.truth(r.equal(r.get(s, "clv2"), 0))) {
    r.assign(r.slot(s, ["cl2"]), "grey b");
  } else {
    if (r.truth((r.compare(r.get(s, "clv2"), 3) <= 0))) {
      r.assign(r.slot(s, ["cl2"]), "white");
    } else {
      if (r.truth((r.compare(r.get(s, "clv2"), 9) <= 0))) {
        r.assign(r.slot(s, ["cl2"]), "yellow b");
      } else {
        if (r.truth((r.compare(r.get(s, "clv2"), 15) <= 0))) {
          r.assign(r.slot(s, ["cl2"]), "orange");
        } else {
          r.assign(r.slot(s, ["cl2"]), "red b");
        }
      }
    }
  }
  if (r.truth(r.equal(r.get(s, "clv3"), 0))) {
    r.assign(r.slot(s, ["cl3"]), "grey b");
  } else {
    if (r.truth((r.compare(r.get(s, "clv3"), 3) <= 0))) {
      r.assign(r.slot(s, ["cl3"]), "white");
    } else {
      if (r.truth((r.compare(r.get(s, "clv3"), 9) <= 0))) {
        r.assign(r.slot(s, ["cl3"]), "yellow b");
      } else {
        if (r.truth((r.compare(r.get(s, "clv3"), 15) <= 0))) {
          r.assign(r.slot(s, ["cl3"]), "orange");
        } else {
          r.assign(r.slot(s, ["cl3"]), "red b");
        }
      }
    }
  }
  await r.write("使用技能点强化你的相应属性，各项升级均每次消耗<span class=\"lime b\">1</span>技能点\r\n<span style=\"height:4px; display:block;\">&nbsp;</span>\r\n<table align=\"center\" text-align=\"center\" width=\"420px\" CellSpacing=0 CellPadding=0>\r\n<tr>\r\n<td class=\"b3\" width=\"115px\">隐蔽率/先攻率</td>\r\n<td class=\"b3\" width=\"46px\"><span class=\"");
  await r.write(r.text(r.get(s, "cl1")));
  await r.write("\"><span>");
  await r.write(r.text(r.get(s, "clv1")));
  await r.write("</span>/20</span></td>\r\n<td class=\"b3\" width=\"115px\">闪避率/反击率</td>\r\n<td class=\"b3\" width=\"46px\"><span class=\"");
  await r.write(r.text(r.get(s, "cl2")));
  await r.write("\"><span>");
  await r.write(r.text(r.get(s, "clv2")));
  await r.write("</span>/20</span></td>\r\n<td class=\"b3\" width=\"50px\">命中率</td>\r\n<td class=\"b3\" width=\"46px\"><span class=\"");
  await r.write(r.text(r.get(s, "cl3")));
  await r.write("\"><span>");
  await r.write(r.text(r.get(s, "clv3")));
  await r.write("</span>/20</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\"> \r\n<span class=\"");
  await r.write(r.text(r.get(s, "cl1")));
  await r.write("\">+<span>");
  await r.write(r.text(r.get(s, "v1")));
  await r.write("</span>% +<span>");
  await r.write(r.text(r.get(s, "v2")));
  await r.write("</span>%</span>\r\n</td>\r\n<td class=\"b3\">");
  if (r.truth((r.compare(r.get(s, "clv1"), 20) < 0))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), 0) > 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill248_special';$('subcmd').value='upgrade';$('skillpara1').value='1';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>\r\n<td class=\"b3\"> \r\n<span class=\"");
  await r.write(r.text(r.get(s, "cl2")));
  await r.write("\">+<span>");
  await r.write(r.text(r.get(s, "v3")));
  await r.write("</span>% <!--+<span>");
  await r.write(r.text(r.get(s, "v4")));
  await r.write("</span>%--> +<span>");
  await r.write(r.text(r.get(s, "v5")));
  await r.write("</span>%</span>\r\n</td>\r\n<td class=\"b3\">");
  if (r.truth((r.compare(r.get(s, "clv2"), 20) < 0))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), 0) > 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill248_special';$('subcmd').value='upgrade';$('skillpara1').value='2';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>\r\n<td class=\"b3\"> \r\n<span class=\"");
  await r.write(r.text(r.get(s, "cl3")));
  await r.write("\">+<span>");
  await r.write(r.text(r.get(s, "v6")));
  await r.write("</span>%</span>\r\n</td>\r\n<td class=\"b3\">");
  if (r.truth((r.compare(r.get(s, "clv3"), 20) < 0))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), 0) > 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill248_special';$('subcmd').value='upgrade';$('skillpara1').value='3';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>\r\n</tr>\r\n</table>\r\n</td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
