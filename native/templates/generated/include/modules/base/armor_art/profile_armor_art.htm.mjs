// Generated from include/modules/base/armor_art/profile_armor_art.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<tr>\r\n<TD class=b2 height=\"26\"><span>");
  if (r.truth(r.get(s, "arts"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "artk_words")));
  } else {
    await r.write("<span class=\"grey b\">");
    await r.write(r.text(r.get(r.get(s, "iteminfo"), "A")));
    await r.write("</span>");
  }
  await r.write("</span></TD>\r\n<TD class=b3>");
  if (r.truth((r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command")))) && r.truth(r.get(s, "arts"))))) {
    await r.write("<span><input type=\"button\" value=\"卸下\" onclick=\"$('mode').value='itemmain';$('command').value='offart';postCmd('gamecmd','command.php');return false;\"</span>");
  }
  await r.write("<span>");
  if (r.truth(r.get(s, "arts"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "art_words")));
  } else {
    await r.write(r.text(r.get(s, "noitm")));
  }
  await r.write("</span>\r\n</TD>\r\n<TD class=b3><span ");
  if (r.truth((r.truth(r.get(s, "arts")) && r.truth(r.get(r.get(s, "tpldata"), "artsk_desc"))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(r.get(s, "tpldata"), "artsk_desc")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "tpldata"), "artsk_words"))))))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "artsk_words")));
  } else {
    await r.write("--");
  }
  await r.write("</span></TD>\r\n<TD class=b3><span>");
  if (r.truth(r.get(s, "arts"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "arte_words")));
  } else {
    await r.write("0");
  }
  await r.write("</span></TD>\r\n<TD class=b3><span>");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "arts_words")));
  await r.write("</span></TD>\r\n</tr> ");
return 1;
}
