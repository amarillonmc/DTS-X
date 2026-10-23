// Generated from include/modules/extra/club/skills/skill272/skill272_command.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill272_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"activate\">");
  r.imports(s, "skill272", "player", "itemmain");
  (await r.module("itemmain", "parse_interface_profile"));
  r.assign(r.slot(s, ["effect_list"]), (await r.module("skill272", "create_effect_list272")));
  await r.write("选择1个装备/道具，<span class=\"yellow b\">必须具有以下属性1个以上：</span><br>\r\n<span class=\"grey b\">");
  r.assign(r.slot(s, ["i"]), 1);
  if (r.truth((await r.call("is_array", (await r.module("skill272", "create_effect_list272")))))) {
    {
      const a0 = r.copy((await r.module("skill272", "create_effect_list272")));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["skval"]), v0);
        await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(s, "skval"))));
        await r.write(" ");
        r.post(r.slot(s, ["i"]), 1);
        if (r.truth(r.equal(r.modulo(r.get(s, "i"), 10), 0))) {
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("</span><br>\r\n你将吸收掉道具上的这些属性，之后战斗属性伤害增加<span class=\"yellow b\">（吸收数目×");
  await r.write(r.text(r.get(s, "skill272_factor")));
  await r.write("%）</span>，并可能额外获得方块。发动后<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill272_act_time")));
  await r.write("</span>秒有效。\r\n<br><br>\r\n请选择你将吸收属性的装备/道具：<br>\r\n<select id=\"skill272_ipos\" name=\"skill272_ipos\" value=\"back\">");
  if (r.truth((await r.call("is_array", r.get(s, "skill272_pos_list"))))) {
    {
      const a1 = r.copy(r.get(s, "skill272_pos_list"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["val"]), v1);
        if (r.truth((r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "val"), "ar")), 0)) || r.truth(r.equal("wep", r.get(s, "val"))))) && r.truth((await r.module("skill272", "check_valid_single272", r.get(s, "val"), 1, r.get(s, "effect_list"))))))) {
          await r.write("<option value=\"");
          await r.write(r.text(r.get(s, "val")));
          await r.write("\">");
          await r.write(r.text(r.get(r.get(s, "sdata"), r.get(s, "val"))));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text(r.get(s, "val")) + r.text("sk_words")))));
          await r.write("<br>");
        } else {
          if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "val"), "itm")), 0)) && r.truth((await r.module("skill272", "check_valid_single272", r.get(s, "val"), 1, r.get(s, "effect_list"))))))) {
            r.assign(r.slot(s, ["tmp_itmskn"]), (r.text((r.text("itmsk") + r.text((await r.call("substr", r.get(s, "val"), 3, 1))))) + r.text("_words")));
            await r.write("<option value=\"");
            await r.write(r.text(r.get(s, "val")));
            await r.write("\">");
            await r.write(r.text(r.get(r.get(s, "sdata"), r.get(s, "val"))));
            await r.write(" / ");
            await r.write(r.text(r.get(r.get(s, "tpldata"), r.get(s, "tmp_itmskn"))));
            await r.write("<br>");
          }
        }
      }
    }
  }
  await r.write("</select>\r\n<br>\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
