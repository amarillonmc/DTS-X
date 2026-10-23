// Generated from templates/default/usergdicon.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table>\r\n<tr>\r\n<td>性别</td>\r\n<td>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "female"], [r.APPEND, "male"]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, "female"], [r.APPEND, "male"]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["gn"]), v0);
        await r.write("            ");
        r.assign(r.slot(s, ["g"]), r.get(r.get(s, "gn"), "0"));
        r.assign(r.slot(s, ["go"]), (r.truth(r.equal("f", r.get(s, "g"))) ? "m" : "f"));
        await r.write("<input type=\"radio\" id=\"");
        await r.write(r.text(r.get(s, "gn")));
        await r.write("\" class=\"radio_comb\" name=\"gender\" onclick=\"if(!$('sel_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("').checked) $('sel_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("').click();userIconMover();\" value=\"");
        await r.write(r.text(r.get(s, "g")));
        await r.write("\" ");
        if (r.truth(r.equal(r.get(s, "gender"), (r.text(r.get(s, "g")))))) {
          await r.write("checked");
        }
        await r.write(" />\r\n<a onclick=\"$('");
        await r.write(r.text(r.get(s, "gn")));
        await r.write("').click();\">");
        await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "g"))));
        await r.write("</a>\r\n&nbsp;&nbsp;&nbsp;");
      }
    }
  }
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>头像<br>&nbsp;</td>\r\n<td>\r\n<div>\r\n<span class=\"cyan b\">点击头像可展开选择页面</span>\r\n</div><div id=\"userIconImg\" class=\"iconImg\" onclick=\"bubblebox_show('pc_icon_selecting');\">\r\n<img src=\"img/");
  await r.write(r.text(r.get((await r.module("player", "icon_parser", 0, r.get(s, "gender"), r.get(s, "icon"))), 0)));
  await r.write("\" />\r\n</div>\r\n<input type=\"hidden\" id=\"icon_selected\" name=\"icon\" value=\"");
  await r.write(r.text(r.get(s, "icon")));
  await r.write("\" />\r\n</td>\r\n</tr>\r\n</table>");
  (await r.call("bubblebox_start", "id:pc_icon_selecting;height:510;width:716;cancellable:1;z-index-base:35;"));
  (await r.include(r.template("pc_icon_selecting"), s));
  (await r.call("bubblebox_end"));
return 1;
}
