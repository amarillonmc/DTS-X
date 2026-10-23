// Generated from templates/default/bubblebox_start.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div id=\"fmsgbox");
  await r.write(r.text(r.get(s, "bbox_id")));
  await r.write("\" style=\"display:none\">\r\n\r\n<!--构建半透明外缘-->\r\n<div class=\"bubblebox_positioner\" style=\"z-index:calc(");
  await r.write(r.text(r.get(s, "bbox_z_index_base")));
  await r.write(" + 3);\">\r\n<div class=\"bubblebox_positioner_inner\" style=\"z-index:calc(");
  await r.write(r.text(r.get(s, "bbox_z_index_base")));
  await r.write(" + 4); \r\nmargin-top:");
  await r.write(r.text(r.get(s, "bbox_positioner_inner_margin_top")));
  await r.write("px; \r\nmargin-left:");
  await r.write(r.text(r.get(s, "bbox_positioner_inner_margin_left")));
  await r.write("px;\r\nmin-width:");
  await r.write(r.text(r.get(s, "bbox_positioner_inner_min_width")));
  await r.write("px; \r\nmax-width:");
  await r.write(r.text(r.get(s, "bbox_positioner_inner_max_width")));
  await r.write("px; \r\nmin-height:");
  await r.write(r.text(r.get(s, "bbox_positioner_inner_min_height")));
  await r.write("px;\r\nmax-height:");
  await r.write(r.text(r.get(s, "bbox_positioner_inner_max_height")));
  await r.write("px;\">\r\n</div>\r\n</div>\r\n<!--END-->\r\n\r\n<!--构建文本框-->\r\n<!--全屏背景降低+跳出点击区-->\r\n<div class=\"bubblebox_positioner bubblebox_screen_fader\" style=\"z-index:calc(");
  await r.write(r.text(r.get(s, "bbox_z_index_base")));
  await r.write(" + 3);\" ");
  if (r.truth((!r.truth((!r.truth(r.get(s, "bbox_change_to"))))))) {
    await r.write(" onclick=\"bubblebox_show('");
    await r.write(r.text(r.get(s, "bbox_change_to")));
    await r.write("');bubblebox_hide('");
    await r.write(r.text(r.get(s, "bbox_id")));
    await r.write("');\"");
  } else {
    if (r.truth((!r.truth((!r.truth(r.get(s, "bbox_cancellable"))))))) {
      await r.write(" onclick=\"bubblebox_hide('");
      await r.write(r.text(r.get(s, "bbox_id")));
      await r.write("');\"");
    }
  }
  await r.write(">\r\n<div class=\"bubblebox_screen_fader_inner\" style=\"z-index:calc(");
  await r.write(r.text(r.get(s, "bbox_z_index_base")));
  await r.write(" + 5);\r\nmargin-top:");
  await r.write(r.text(r.get(s, "bbox_screen_fader_inner_margin_top")));
  await r.write("px; \r\nmargin-left:");
  await r.write(r.text(r.get(s, "bbox_screen_fader_inner_margin_left")));
  await r.write("px;\r\nmin-width:");
  await r.write(r.text(r.get(s, "bbox_screen_fader_inner_min_width")));
  await r.write("px;\r\nmax-width:");
  await r.write(r.text(r.get(s, "bbox_screen_fader_inner_max_width")));
  await r.write("px;\r\nmin-height:");
  await r.write(r.text(r.get(s, "bbox_screen_fader_inner_min_height")));
  await r.write("px;\r\nmax-height:");
  await r.write(r.text(r.get(s, "bbox_screen_fader_inner_max_height")));
  await r.write("px;\r\nfilter:alpha(opacity=");
  await r.write(r.text((await r.call("round", r.multiply(r.get(s, "bbox_opacity"), 100)))));
  await r.write(");\r\nopacity:");
  await r.write(r.text(r.get(s, "bbox_opacity")));
  await r.write(";\" \r\nonclick=\"if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; \"\r\n>\r\n<div class=\"bubblebox_container\" style=\"z-index:calc(");
  await r.write(r.text(r.get(s, "bbox_z_index_base")));
  await r.write(" + 6);\r\nmargin-left:");
  await r.write(r.text(r.get(s, "bbox_margin_left")));
  await r.write("px;\r\nmargin-top:");
  await r.write(r.text(r.get(s, "bbox_margin_top")));
  await r.write("px;\r\nmargin-right:0px;\r\nmargin-bottom:");
  await r.write(r.text(r.get(s, "bbox_margin_bottom")));
  await r.write("px;\r\nmin-height:");
  await r.write(r.text(r.get(s, "bubblebox_container_min_height")));
  await r.write("px;\r\nmax-height:");
  await r.write(r.text(r.get(s, "bubblebox_container_max_height")));
  await r.write("px;\"\r\n>\r\n<div class=\"bubblebox_container_inner gscroll ");
  if (r.truth(r.get(s, "bbox_scroll_bar"))) {
    await r.write("scroll-pane");
    await r.write(r.text(r.get(s, "bbox_id")));
  }
  await r.write("\" style=\"max-height:");
  await r.write(r.text(r.get(s, "bbox_height")));
  await r.write("px;width:");
  await r.write(r.text(r.get(s, "bbox_width")));
  await r.write("px; \">\r\n<!--END-->");
return 1;
}
