// Generated from include/modules/extra/gmskills/skill1010/mani_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill1010_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"meet\">\r\n请选择当前地图的以下角色进行遭遇：<br>");
  if (r.truth((await r.call("is_array", r.get(s, "pcs"))))) {
    {
      const a0 = r.copy(r.get(s, "pcs"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["pcid"]), k0);
        r.assign(r.slot(s, ["pcd"]), v0);
        await r.write("<input type=\"radio\" name=\"mpid\" id=\"mani");
        await r.write(r.text(r.get(s, "pcid")));
        await r.write("\" value=\"");
        await r.write(r.text(r.get(s, "pcid")));
        await r.write("\">\r\n<a onclick=sl('mani");
        await r.write(r.text(r.get(s, "pcid")));
        await r.write("'); href=\"javascript:void(0);\" >\r");
        await r.write(r.text(r.get(r.get(s, "typeinfo"), r.get(r.get(s, "pcd"), "type"))));
        await r.write(" ");
        if (r.truth((r.compare(r.get(r.get(s, "pcd"), "hp"), 0) <= 0))) {
          await r.write("<span class=\"red b\">");
          await r.write(r.text(r.get(r.get(s, "pcd"), "name")));
          await r.write("</span>");
        } else {
          await r.write(r.text(r.get(r.get(s, "pcd"), "name")));
        }
        await r.write(" \r\nLv.");
        await r.write(r.text(r.get(r.get(s, "pcd"), "lvl")));
        await r.write(" ");
        if (r.truth((r.compare(r.get(r.get(s, "pcd"), "hp"), 0) <= 0))) {
          await r.write("<span class=\"red b\">生命 ");
          await r.write(r.text(r.get(r.get(s, "pcd"), "hp")));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "pcd"), "mhp")));
          await r.write("</span>");
        } else {
          await r.write("生命 ");
          await r.write(r.text(r.get(r.get(s, "pcd"), "hp")));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "pcd"), "mhp")));
        }
        await r.write(" \r\n</a><br>");
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"遭遇所选\" onclick=\"$('subcmd').value='meet';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"交换数据\" onclick=\"$('subcmd').value='exma';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
