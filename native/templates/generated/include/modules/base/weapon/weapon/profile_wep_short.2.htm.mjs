// Generated from include/modules/base/weapon/weapon/profile_wep_short.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack itmname forshort\">");
  r.assign(r.slot(s, ["tmp_eqpname"]), r.get(r.get(s, "tpldata"), "wep_words_short"));
  await r.write("<span ");
  if (r.truth((!r.truth(r.get(s, "weps"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth((!r.equal(r.get(s, "tmp_eqpname"), r.get(s, "wep"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "wep")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth(r.get(s, "weps"))) {
    await r.write(r.text(r.get(s, "tmp_eqpname")));
  } else {
    await r.write(r.text(r.get(s, "nowep")));
  }
  await r.write("</span>\r\n</div>\r\n</div>");
return 1;
}
