// Generated from include/modules/base/armor_art/profile_armor_art.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack itmk\" style=\"margin-left:5px\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "arts"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth(r.get(r.get(s, "tpldata"), "artk_desc"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(r.get(s, "tpldata"), "artk_desc")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth(r.get(r.get(s, "tpldata"), "artk_words"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "artk_words")));
  } else {
    await r.write(r.text(r.get(r.get(s, "iteminfo"), "A")));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itmname\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "arts"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), "art_words"), r.get(s, "art"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "art")));
    await r.write("\"");
  }
  await r.write(">");
  if (r.truth(r.get(s, "arts"))) {
    await r.write(r.text(r.get(r.get(s, "tpldata"), "art_words")));
  } else {
    await r.write(r.text(r.get(s, "noitm")));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itmsk\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "arts"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "arts")) && r.truth(r.get(r.get(s, "tpldata"), "artsk_desc"))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(r.get(s, "tpldata"), "artsk_desc")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "artsk_words")));
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itme\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "arts"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "arts")) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), "arte_words"), r.get(s, "arte"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "arte")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "arte_words")));
  await r.write("</span>\r\n</div><div class=\"profile_bar pack itms\">\r\n<span ");
  if (r.truth((!r.truth(r.get(s, "arts"))))) {
    await r.write("class=\"grey\"");
  }
  await r.write(" ");
  if (r.truth((r.truth(r.get(s, "arts")) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), "arts_words"), r.get(s, "arts"))))))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "arts")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "tpldata"), "arts_words")));
  await r.write("</span>\r\n</div>\r\n</div>");
return 1;
}
