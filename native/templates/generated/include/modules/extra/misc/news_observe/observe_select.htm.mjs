// Generated from include/modules/extra/misc/news_observe/observe_select.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"obsv_select\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"back\">");
  r.assign(r.slot(s, ["obsv_id"]), (await r.module("news_observe", "get_observe_groomid")));
  r.assign(r.slot(s, ["obsv_list"]), (await r.module("news_observe", "get_observe_roomlist")));
  r.assign(r.slot(s, ["gti"]), (await r.call("get_var_in_module", "gtinfo", "sys")));
  if (r.truth((r.compare(r.get(s, "obsv_id"), 0) >= 0))) {
    await r.write("<input type=\"button\" class=\"bigbutton\" style=\"width:200px; height:30px;\" value=\"停止窥屏\" onclick=\"$('command').value='obsv-1';postCmd('gamecmd','command.php',this);\" /><br><br>");
  } else {
    await r.write("<span>请选择你要窥屏的房间：</span><br>");
    if (r.truth((await r.call("is_array", r.get(s, "obsv_list"))))) {
      {
        const a0 = r.copy(r.get(s, "obsv_list"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["data"]), v0);
          r.assign(r.slot(s, ["i"]), r.get(r.get(s, "data"), "groomid"));
          if (r.truth((!r.truth(r.get(s, "i"))))) {
            await r.write("<input type=\"button\" class=\"bigbutton\" style=\"width:140px; height:30px;\" value=\"大房间\" onclick=\"$('command').value='obsv0';postCmd('gamecmd','command.php',this);\" />");
          } else {
            await r.write("<input type=\"button\" class=\"bigbutton\" style=\"width:140px; height:30px;\" value=\"");
            await r.write(r.text(r.get(s, "i")));
            await r.write("号房间\" onclick=\"$('command').value='obsv");
            await r.write(r.text(r.get(s, "i")));
            await r.write("';postCmd('gamecmd','command.php',this);\" />");
          }
          await r.write("<span class=\"b\">");
          await r.write(r.text(r.get(r.get(s, "gti"), r.get(r.get(s, "data"), "gametype"))));
          await r.write("</span><br>");
        }
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"bigbutton\" style=\"width:200px; height:30px;\" value=\"返回\" onclick=\"$('command').value='back';postCmd('gamecmd','command.php',this);\" />");
return 1;
}
