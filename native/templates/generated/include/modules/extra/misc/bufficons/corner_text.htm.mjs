// Generated from include/modules/extra/misc/bufficons/corner_text.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth(((r.get(r.get(s, "para"), "corner-text") != null)))) {
    await r.write("<div style=\"position:absolute; bottom:-1px; right:1px; color:#ffffff\">\r\n\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n\r\n<div style=\"position:absolute; top:-1px; left:0px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:1px; left:0px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:0px; left:-1px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:0px; left:1px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:-1px; left:-1px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:-1px; left:1px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:1px; left:-1px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:1px; left:1px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<span style=\"font-size:11px;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div><div style=\"position:absolute; top:0px; left:0px; \">\r\n<span style=\"font-size:11px; color:#000000;\">");
    await r.write(r.text(r.get(r.get(s, "para"), "corner-text")));
    await r.write("</span>\r\n</div>");
  }
return 1;
}
