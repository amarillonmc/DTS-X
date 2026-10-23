// Generated from include/modules/base/weapon/weapon/profile_wep.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack itmk\" style=\"margin-left:5px\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "weps"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
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
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itmname\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "weps"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), "wep_words"), r.get(s, "wep"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "wep")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth(r.get(s, "weps"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wep_words")));
  } else {
    await r.write(r.text(r.get(s, "nowep")));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itmsk\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "weps"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth(r.get(r.get(s, "tpldata"), "wepsk_desc"))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(r.get(s, "tpldata"), "wepsk_desc")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "wepsk_words")));
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itme\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "weps"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), "wepe_words"), r.get(s, "wepe"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "wepe")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "wepe_words")));
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itms\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "weps"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), "weps_words"), r.get(s, "weps"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "weps")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "weps_words")));
  await r.write("</span>\r\n</div>\r\n</div>");
return 1;
}
