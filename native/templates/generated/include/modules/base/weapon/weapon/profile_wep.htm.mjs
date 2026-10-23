// Generated from include/modules/base/weapon/weapon/profile_wep.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<tr>\r\n<TD class=b2 height=\"26\"><span ");
  if (r.truth(r.get(r.get(s, "tpldata"), "wepk_desc"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wepk_desc")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth(r.get(r.get(s, "tpldata"), "wepk_words"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wepk_words")));
  } else {
    await r.write(r.text(r.get(s, "mltwk")));
  }
  await r.write("</span></TD>\r\n<TD class=b3>");
  if (r.truth((r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command")))) && r.truth((!r.equal("WN", r.get(s, "wepk"))))))) {
    await r.write("<span><input type=\"button\" value=\"卸下\" onclick=\"$('mode').value='itemmain';$('command').value='offwep';postCmd('gamecmd','command.php');return false;\"</span>");
  }
  await r.write("<span>");
  if (r.truth(r.get(s, "weps"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wep_words")));
  } else {
    await r.write(r.text(r.get(s, "nowep")));
  }
  await r.write("</span>\r\n</TD>\r\n<TD class=b3><span ");
  if (r.truth(r.get(r.get(s, "tpldata"), "wepsk_desc"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wepsk_desc")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "tpldata"), "wepsk_words"))))))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wepsk_words")));
  } else {
    await r.write("--");
  }
  await r.write("</span></TD>\r\n<TD class=b3><span>");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "wepe_words")));
  await r.write("</span></TD>\r\n<TD class=b3><span>");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "weps_words")));
  await r.write("</span></TD>\r\n</tr> \r\n");
return 1;
}
