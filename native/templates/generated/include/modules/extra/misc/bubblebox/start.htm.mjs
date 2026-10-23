// Generated from include/modules/extra/misc/bubblebox/start.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["bbox_id"]), (await r.module("bubblebox", "bubblebox_get_style", "id")));
  r.assign(r.slot(s, ["bbox_width"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "width"))));
  r.assign(r.slot(s, ["bbox_height"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "height"))));
  r.assign(r.slot(s, ["bbox_z_index_base"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "z-index-base"))));
  r.assign(r.slot(s, ["bbox_offset_x"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "offset-x"))));
  r.assign(r.slot(s, ["bbox_offset_y"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "offset-y"))));
  r.assign(r.slot(s, ["bbox_opacity"]), r.number((await r.module("bubblebox", "bubblebox_get_style", "opacity"))));
  r.assign(r.slot(s, ["bbox_cancellable"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "cancellable"))));
  r.assign(r.slot(s, ["bbox_scroll_bar"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "scroll-bar"))));
  r.assign(r.slot(s, ["bbox_border_width_x"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "border-width-x"))));
  r.assign(r.slot(s, ["bbox_border_width_y"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "border-width-y"))));
  r.assign(r.slot(s, ["bbox_margin_top"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "margin-top"))));
  r.assign(r.slot(s, ["bbox_margin_bottom"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "margin-bottom"))));
  r.assign(r.slot(s, ["bbox_margin_left"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "margin-left"))));
  r.assign(r.slot(s, ["bbox_margin_right"]), r.int((await r.module("bubblebox", "bubblebox_get_style", "margin-right"))));
  await r.write("<div id=\"fmsgbox");
  await r.write(r.text(r.get(s, "bbox_id")));
  await r.write("\" style=\"display:none\">\r\n\r\n<!--构建半透明外缘-->\r\n<div class=\"bubblebox_positioner\" style=\"z-index:");
  await r.write(r.text(r.add(3, r.get(s, "bbox_z_index_base"))));
  await r.write(";\">\r\n<div style=\"position:absolute; z-index:");
  await r.write(r.text(r.add(4, r.get(s, "bbox_z_index_base"))));
  await r.write("; top:50%; margin-top:");
  await r.write(r.text((r.text(r.subtract(r.get(s, "bbox_offset_y"), (await r.call("ceil", r.divide(r.add(r.add(r.add(r.get(s, "bbox_height"), r.multiply(r.get(s, "bbox_border_width_y"), 2)), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom")), 2))))) + r.text("px"))));
  await r.write("; left:50%; margin-left:");
  await r.write(r.text((r.text(r.subtract(r.get(s, "bbox_offset_x"), (await r.call("ceil", r.divide(r.add(r.add(r.add(r.get(s, "bbox_width"), r.multiply(r.get(s, "bbox_border_width_x"), 2)), r.get(s, "bbox_margin_left")), r.get(s, "bbox_margin_right")), 2))))) + r.text("px"))));
  await r.write("; \r\nfilter:alpha(opacity=20); opacity:0.2; min-width:");
  await r.write(r.text((r.text(r.add(r.add(r.add(r.get(s, "bbox_width"), r.multiply(r.get(s, "bbox_border_width_x"), 2)), r.get(s, "bbox_margin_left")), r.get(s, "bbox_margin_right"))) + r.text("px"))));
  await r.write("; max-width:");
  await r.write(r.text((r.text(r.add(r.add(r.add(r.get(s, "bbox_width"), r.multiply(r.get(s, "bbox_border_width_x"), 2)), r.get(s, "bbox_margin_left")), r.get(s, "bbox_margin_right"))) + r.text("px"))));
  await r.write("; min-height:");
  await r.write(r.text((r.text(r.add(r.add(r.add(r.get(s, "bbox_height"), r.multiply(r.get(s, "bbox_border_width_y"), 2)), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom"))) + r.text("px"))));
  await r.write("; max-height:");
  await r.write(r.text((r.text(r.add(r.add(r.add(r.get(s, "bbox_height"), r.multiply(r.get(s, "bbox_border_width_y"), 2)), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom"))) + r.text("px"))));
  await r.write("; background-color:#000000\">\r\n</div>\r\n</div>\r\n<!--END-->\r\n\r\n<!--构建文本框-->\r\n<!--全屏背景降低+跳出点击区-->\r\n<div class=\"bubblebox_positioner\" style=\"z-index:");
  await r.write(r.text(r.add(3, r.get(s, "bbox_z_index_base"))));
  await r.write(";background-color:rgba(0,0,0,0.35);\" ");
  if (r.truth(r.get(s, "bbox_cancellable"))) {
    await r.write(" onclick=\"bubblebox_hide('");
    await r.write(r.text(r.get(s, "bbox_id")));
    await r.write("');\"");
  }
  await r.write(">\r\n<div style=\"position:absolute; z-index:");
  await r.write(r.text(r.add(5, r.get(s, "bbox_z_index_base"))));
  await r.write("; top:50%; margin-top:");
  await r.write(r.text((r.text(r.subtract(r.get(s, "bbox_offset_y"), (await r.call("ceil", r.divide(r.add(r.add(r.get(s, "bbox_height"), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom")), 2))))) + r.text("px"))));
  await r.write("; left:50%; margin-left:");
  await r.write(r.text((r.text(r.subtract(r.get(s, "bbox_offset_x"), (await r.call("ceil", r.divide(r.add(r.add(r.get(s, "bbox_width"), r.get(s, "bbox_margin_left")), r.get(s, "bbox_margin_right")), 2))))) + r.text("px"))));
  await r.write(";\r\n min-width:");
  await r.write(r.text((r.text(r.add(r.add(r.get(s, "bbox_width"), r.get(s, "bbox_margin_left")), r.get(s, "bbox_margin_right"))) + r.text("px"))));
  await r.write("; max-width:");
  await r.write(r.text((r.text(r.add(r.add(r.get(s, "bbox_width"), r.get(s, "bbox_margin_left")), r.get(s, "bbox_margin_right"))) + r.text("px"))));
  await r.write("; min-height:");
  await r.write(r.text((r.text(r.add(r.add(r.get(s, "bbox_height"), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom"))) + r.text("px"))));
  await r.write("; max-height:");
  await r.write(r.text((r.text(r.add(r.add(r.get(s, "bbox_height"), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom"))) + r.text("px"))));
  await r.write(";\r\n filter:alpha(opacity=");
  await r.write(r.text((await r.call("round", r.multiply(r.get(s, "bbox_opacity"), 100)))));
  await r.write("); opacity:");
  await r.write(r.text(r.get(s, "bbox_opacity")));
  await r.write("; background-color:#000000;\"\r\n onclick=\"if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; \">\r\n<div class=\"bubblebox_container\" style=\"z-index:");
  await r.write(r.text(r.add(6, r.get(s, "bbox_z_index_base"))));
  await r.write(";margin-left:");
  await r.write(r.text(r.get(s, "bbox_margin_left")));
  await r.write("px; margin-top:");
  await r.write(r.text(r.get(s, "bbox_margin_top")));
  await r.write("px; margin-right:0px; margin-bottom:");
  await r.write(r.text(r.get(s, "bbox_margin_bottom")));
  await r.write("px; min-height:");
  await r.write(r.text((r.text(r.add(r.add(r.get(s, "bbox_height"), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom"))) + r.text("px"))));
  await r.write("; max-height:");
  await r.write(r.text((r.text(r.add(r.add(r.get(s, "bbox_height"), r.get(s, "bbox_margin_top")), r.get(s, "bbox_margin_bottom"))) + r.text("px"))));
  await r.write(";\" >\r\n<div ");
  if (r.truth(r.get(s, "bbox_scroll_bar"))) {
    await r.write(r.text((r.text((r.text("class=\"scroll-pane") + r.text(r.get(s, "bbox_id")))) + r.text("\""))));
  }
  await r.write(" style=\"max-height:");
  await r.write(r.text(r.get(s, "bbox_height")));
  await r.write("px; width:");
  await r.write(r.text(r.get(s, "bbox_width")));
  await r.write("px; margin:0; overflow-x:hidden; overflow-y:auto; position:relative;\">\r\n<!--END-->");
return 1;
}
