// Generated from include/modules/extra/misc/npcchat_bubble/bubblepage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--传入一个bubblecont变量-->\r\n<div class=\"dialogue-bubble-container\">");
  r.assign(r.slot(s, ["imax"]), (await r.call("sizeof", r.get(s, "bubblecont"))));
  if (r.truth((await r.call("is_array", r.get(s, "bubblecont"))))) {
    {
      const a0 = r.copy(r.get(s, "bubblecont"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<div class=\"dialogue-bubble\">\r\n<div>");
        await r.write(r.text(r.get(s, "v")));
        await r.write("</div>\r\n </div>\r\n ");
      }
    }
  }
  await r.write("</div>");
return 1;
}
