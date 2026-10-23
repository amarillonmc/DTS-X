// Generated from include/modules/base/rest/rest_cmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "rest");
  await r.write("<span style=\"position: relative;\">\r\n    <input type=\"button\" class=\"cmdbutton\" value=\"睡眠菜单\" onmouseenter=\"$('restmenu').style.display='block';\">\r\n    <div id=\"restmenu\" class=\"hoveringBlock\" style=\"position: absolute; display: none; width: 90px; height: 85px; left: -10px; bottom: -12px; text-align: center; padding: 7px;\" onmouseleave=\"$('restmenu').style.display='none';\">\r\n        <input type=\"button\" class=\"cmdbutton\" id=\"rest1\" value=\"睡眠\" onclick=\"$('command').value='rest1';postCmd('gamecmd','command.php',this);\"><br />\r\n        <input type=\"button\" class=\"cmdbutton\" id=\"rest2\" value=\"治疗\" onclick=\"$('command').value='rest2';postCmd('gamecmd','command.php',this);\"><br />\r\n        ");
  if (r.truth((await r.call("in_array", r.get(s, "pls"), r.get(s, "rest_hospital_list"))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"rest3\" value=\"静养\" onclick=\"$('command').value='rest3';postCmd('gamecmd','command.php',this);\">");
  }
  await r.write("    </div>\r\n</span>");
return 1;
}
