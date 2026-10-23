// Generated from include/modules/base/rest/rest_cmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "rest");
  await r.write("<div class=\"cmd_row\">");
  if (r.truth((await r.call("in_array", r.get(s, "pls"), r.get(s, "rest_hospital_list"))))) {
    await r.write("<div class=\"cmd_positioner common_cmd\" style=\"width:336px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"静养\" \r\nonclick=\"$('command').value='rest3';postCmd('gamecmd','command.php',this);\">\r\n</div>");
  } else {
    await r.write("<div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"睡眠\" \r\nonclick=\"$('command').value='rest1';postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"治疗\" \r\nonclick=\"$('command').value='rest2';postCmd('gamecmd','command.php',this);\">\r\n</div>");
  }
  await r.write("</div>");
return 1;
}
