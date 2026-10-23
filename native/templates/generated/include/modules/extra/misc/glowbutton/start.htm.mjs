// Generated from include/modules/extra/misc/glowbutton/start.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<span style=\"display:none;\" ");
  await r.write(r.text((r.text((r.text("id=\"") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-color-container\""))));
  await r.write(">");
  await r.write(r.text((r.text("#") + r.text((await r.module("glowbutton", "glowbutton_get_style", "color"))))));
  await r.write("</span>\r\n<div ");
  await r.write(r.text((r.text((r.text("id=\"") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-container\""))));
  await r.write(" style=\"margin:auto; ");
  if (r.truth(r.equal(r.int((await r.module("glowbutton", "glowbutton_get_style", "clickable"))), 1))) {
    await r.write("cursor:pointer;");
  }
  await r.write("height:");
  await r.write(r.text((r.text(r.text(r.add(r.add(2, r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-y"))), 2)), r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "line-height"))), r.int((await r.module("glowbutton", "glowbutton_get_style", "line-num"))))))) + r.text("px"))));
  await r.write("; width:");
  await r.write(r.text((r.text(r.text(r.add(r.add(2, r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-x"))), 2)), r.int((await r.module("glowbutton", "glowbutton_get_style", "max-text-width")))))) + r.text("px"))));
  await r.write(";\"");
  if (r.truth((r.truth(r.equal(r.int((await r.module("glowbutton", "glowbutton_get_style", "clickable"))), 1)) || r.truth(r.equal(r.int((await r.module("glowbutton", "glowbutton_get_style", "glow-on-hover"))), 1))))) {
    await r.write(r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text("onmouseover=\"$('") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border').style.boxShadow='0px 0px 6px #"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "color"))))) + r.text("';$('"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border').style.MozBoxShadow='0px 0px 6px #"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "color"))))) + r.text("';$('"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border').style.WebkitBoxShadow='0px 0px 6px #"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "color"))))) + r.text("'; if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; \""))));
    await r.write(r.text((r.text((r.text((r.text((r.text((r.text((r.text(" onmouseout=\"$('") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border').style.boxShadow='none';$('"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border').style.MozBoxShadow='none';$('"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border').style.WebkitBoxShadow='none'; if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; \""))));
  }
  await r.write(" ");
  if (r.truth(r.equal(r.int((await r.module("glowbutton", "glowbutton_get_style", "clickable"))), 1))) {
    await r.write(r.text((r.text((r.text("onmousedown=\"") + r.text((await r.module("glowbutton", "glowbutton_get_style", "mousedown-event"))))) + r.text("if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; \""))));
  }
  await r.write(">\r\n<div ");
  await r.write(r.text((r.text((r.text("id=\"") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-background\""))));
  await r.write(" style=\"height:");
  await r.write(r.text((r.text(r.text(r.add(r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-y"))), 2), r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "line-height"))), r.int((await r.module("glowbutton", "glowbutton_get_style", "line-num"))))))) + r.text("px"))));
  await r.write("; width:");
  await r.write(r.text((r.text(r.text(r.add(r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-x"))), 2), r.int((await r.module("glowbutton", "glowbutton_get_style", "max-text-width")))))) + r.text("px"))));
  await r.write("; ");
  await r.write(r.text((r.text((r.text((r.text((r.text("filter:alpha(opacity=") + r.text((await r.call("round", r.multiply(100, r.number((await r.module("glowbutton", "glowbutton_get_style", "background-opacity"))))))))) + r.text("); opacity:"))) + r.text((await r.module("glowbutton", "glowbutton_get_style", "background-opacity"))))) + r.text(";"))));
  await r.write(" border:1px transparent; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px;\"></div><div ");
  await r.write(r.text((r.text((r.text("id=\"") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-border\""))));
  await r.write(" style=\"position:relative; top:");
  await r.write(r.text((r.text(r.text((-r.number(r.add(r.add(1, r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-y"))), 2)), r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "line-height"))), r.int((await r.module("glowbutton", "glowbutton_get_style", "line-num"))))))))) + r.text("px"))));
  await r.write("; left:-1px; height:");
  await r.write(r.text((r.text(r.text(r.add(r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-y"))), 2), r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "line-height"))), r.int((await r.module("glowbutton", "glowbutton_get_style", "line-num"))))))) + r.text("px"))));
  await r.write("; width:");
  await r.write(r.text((r.text(r.text(r.add(r.multiply(r.int((await r.module("glowbutton", "glowbutton_get_style", "margin-x"))), 2), r.int((await r.module("glowbutton", "glowbutton_get_style", "max-text-width")))))) + r.text("px"))));
  await r.write("; ");
  await r.write(r.text((r.text((r.text("border:1px #") + r.text((await r.module("glowbutton", "glowbutton_get_style", "color"))))) + r.text(" solid;"))));
  await r.write(" -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; ");
  await r.write(r.text((r.text((r.text("color: #") + r.text((await r.module("glowbutton", "glowbutton_get_style", "color"))))) + r.text(";"))));
  await r.write(" text-align:center; ");
  await r.write(r.text((r.text((r.text("line-height:") + r.text((await r.module("glowbutton", "glowbutton_get_style", "line-height"))))) + r.text("px;"))));
  await r.write("  filter:alpha(opacity=75); opacity:0.75; \">\r\n<div ");
  await r.write(r.text((r.text((r.text("id=\"") + r.text((await r.module("glowbutton", "glowbutton_get_style", "id"))))) + r.text("-text\""))));
  await r.write(" style=\"margin-left:");
  await r.write(r.text((r.text((await r.module("glowbutton", "glowbutton_get_style", "margin-x"))) + r.text("px"))));
  await r.write("; margin-right:");
  await r.write(r.text((r.text((await r.module("glowbutton", "glowbutton_get_style", "margin-x"))) + r.text("px"))));
  await r.write("; margin-top: ");
  await r.write(r.text((r.text((await r.module("glowbutton", "glowbutton_get_style", "margin-y"))) + r.text("px"))));
  await r.write("; margin-bottom:");
  await r.write(r.text((r.text((await r.module("glowbutton", "glowbutton_get_style", "margin-y"))) + r.text("px"))));
  await r.write("; overflow-x:hidden;overflow-y:hidden;white-space:nowrap;\">");
return 1;
}
