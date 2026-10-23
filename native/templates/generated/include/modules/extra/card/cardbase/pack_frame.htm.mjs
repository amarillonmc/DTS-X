// Generated from include/modules/extra/card/cardbase/pack_frame.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"pack_frame\">\r\n    <div class=\"pack_frame_title\" ");
  if (r.truth(((r.get(s, "title_height") != null)))) {
    await r.write("style=\"height:");
    await r.write(r.text(r.get(s, "title_height")));
    await r.write("px\"");
  }
  await r.write(">\r\n        ");
  await r.write(r.text(r.get(s, "pack_title")));
  await r.write("    </div>\r\n    <div class=\"pack_frame_content\">\r\n        ");
  r.assign(r.slot(s, ["icon"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "packicon"), r.get(s, "packname"))))))) ? r.get(r.get(s, "packicon"), r.get(s, "packname")) : r.get(r.get(s, "packicon"), "Standard Pack")));
  await r.write("        <a ");
  if (r.truth((!r.truth((!r.truth(r.get(s, "pack_href"))))))) {
    await r.write("href=\"");
    await r.write(r.text(r.get(s, "pack_href")));
    await r.write("\"");
  }
  await r.write(">\r\n            <div class=\"pack_border\">\r\n                <img class=\"pack_icon\" src=\"img/cards/");
  await r.write(r.text(r.get(s, "icon")));
  await r.write("\" />\r\n            </div>\r\n        </a>\r\n    </div>\r\n</div>");
return 1;
}
