// Generated from include/modules/extra/gmskills/skill1011/cons_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill1011_special\">");
  if (r.truth(r.equal(1, r.get(s, "cons_page")))) {
    await r.write("请选择需要「具现」哪个地图的道具。<br>\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"cons_page2\">\r\n<input type=\"radio\" name=\"cons_pls\" id=\"cons_pls99\" value=\"99\">\r\n<a onclick=sl('cons_pls99'); href=\"javascript:void(0);\" >全图随机</a><br>");
    if (r.truth((await r.call("is_array", r.get(s, "plsinfo"))))) {
      {
        const a0 = r.copy(r.get(s, "plsinfo"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["plsno"]), k0);
          r.assign(r.slot(s, ["plsname"]), v0);
          await r.write("<input type=\"radio\" name=\"cons_pls\" id=\"cons_pls");
          await r.write(r.text(r.get(s, "plsno")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "plsno")));
          await r.write("\">\r\n<a onclick=sl('cons_pls");
          await r.write(r.text(r.get(s, "plsno")));
          await r.write("'); href=\"javascript:void(0);\" >");
          await r.write(r.text(r.get(s, "plsname")));
          await r.write("</a><br>");
        }
      }
    }
    await r.write("<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
  } else {
    if (r.truth(r.equal(2, r.get(s, "cons_page")))) {
      await r.write("当前地图：");
      if (r.truth(r.equal(99, r.get(s, "cons_pls")))) {
        await r.write("随机");
      } else {
        await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "cons_pls"))));
      }
      await r.write("<br>\r\n请选择需要「具现」的道具名。<br>\r\n<input type=\"hidden\" id=\"cons_pls\" name=\"cons_pls\" value=\"");
      await r.write(r.text(r.get(s, "cons_pls")));
      await r.write("\">\r\n<br><input type=\"radio\" id=\"back\" name=\"subcmd\" value=\"cons_page\"><a onclick=\"sl('back');$('subcmd').name='dummy'\" href=\"javascript:void(0);\" >返回</a><br>\r\n<br>");
      if (r.truth((await r.call("is_array", r.get(s, "itemlist"))))) {
        {
          const a1 = r.copy(r.get(s, "itemlist"));
          for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["iid"]), k1);
            r.assign(r.slot(s, ["item"]), v1);
            await r.write("<input type=\"radio\" name=\"subcmd\" id=\"cons");
            await r.write(r.text(r.get(s, "iid")));
            await r.write("\" value=\"cons");
            await r.write(r.text(r.get(s, "iid")));
            await r.write("\">\r\n<a onclick=\"sl('cons");
            await r.write(r.text(r.get(s, "iid")));
            await r.write("');$('subcmd').name='dummy'\" href=\"javascript:void(0);\" >\r");
            await r.write(r.text(r.get(r.get(s, "item"), "itm")));
            await r.write(" / ");
            await r.write(r.text(r.get(r.get(s, "item"), "itmk")));
            await r.write(" / ");
            await r.write(r.text(r.get(r.get(s, "item"), "itme")));
            await r.write(" /  ");
            await r.write(r.text(r.get(r.get(s, "item"), "itms")));
            await r.write(" / ");
            await r.write(r.text(r.get(r.get(s, "item"), "itmsk")));
            await r.write("</a><br>");
          }
        }
      }
      await r.write("<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
    }
  }
  await r.write(" ");
return 1;
}
