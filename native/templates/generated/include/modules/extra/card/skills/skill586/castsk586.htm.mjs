// Generated from include/modules/extra/card/skills/skill586/castsk586.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill586", "sys", "clubbase", "npc");
  r.assign(r.slot(s, ["skill586_itmarr"]), (await r.module("skill586", "skill586_prepare_itmarr")));
  r.assign(r.slot(s, ["skill586_nowcount_item"]), (await r.call("sizeof", r.get(s, "skill586_itmarr"))));
  r.assign(r.slot(s, ["skill586_npcarr"]), (await r.module("skill586", "skill586_get_npcarr")));
  r.assign(r.slot(s, ["skill586_nowcount_npc"]), (await r.call("sizeof", r.get(s, "skill586_npcarr"))));
  r.assign(r.slot(s, ["skill586_totalcount"]), r.add(r.get(s, "skill586_nowcount_item"), r.get(s, "skill586_nowcount_npc")));
  r.assign(r.slot(s, ["skill586_size"]), (await r.module("skill586", "skill586_get_packsize")));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill586_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"skill586_sendin\" name=\"skill586_sendin\" value=\"\">\r\n<input type=\"hidden\" id=\"skill586_fetchout\" name=\"skill586_fetchout\" value=\"\">\r\n当前异次元中已存放<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill586_nowcount_item")));
  await r.write("</span>个道具和<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill586_nowcount_npc")));
  await r.write("</span>个NPC<br>已使用空间为<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill586_totalcount")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "skill586_size")));
  await r.write("</span><br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill586_itmarr"))))) {
    {
      const a0 = r.copy(r.get(s, "skill586_itmarr"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"取出\" onclick=\"$('skill586_fetchout').value='");
        await r.write(r.text(r.add(r.get(s, "i"), 1)));
        await r.write("';$('skill586_sendin').value='';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write("<br>");
      }
    }
  }
  if (r.truth((await r.call("is_array", r.get(s, "skill586_npcarr"))))) {
    {
      const a1 = r.copy(r.get(s, "skill586_npcarr"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["i"]), v1);
        r.assign(r.slot(s, ["tnpc"]), (await r.module("player", "fetch_playerdata_by_pid", r.get(s, "i"))));
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"放出\" onclick=\"$('skill586_fetchout').value='");
        await r.write(r.text(r.add(r.get(s, "i"), 101)));
        await r.write("';$('skill586_sendin').value='';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
        await r.write(r.text(r.get(r.get(s, "npc_typeinfo"), r.get(r.get(s, "tnpc"), "type"))));
        await r.write(" ");
        await r.write(r.text(r.get(r.get(s, "tnpc"), "name")));
        await r.write("/Lv. ");
        await r.write(r.text(r.get(r.get(s, "tnpc"), "lvl")));
        await r.write("<br>");
      }
    }
  }
  await r.write("<br><br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]))))) {
    {
      const a2 = r.copy(r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
      for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["i"]), v2);
        if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))))))) {
          await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"存入\" onclick=\"$('skill586_fetchout').value='';$('skill586_sendin').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
