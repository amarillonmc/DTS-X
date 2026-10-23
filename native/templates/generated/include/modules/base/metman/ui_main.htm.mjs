// Generated from include/modules/base/metman/ui_main.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--\r\nTable Design:\r\n  140p |  440p  | 140p\r\n/======================\\\r\n|      |               |\r\n|      | Enemy Profile |    \r\n|      |               |\r\n| Icon +========+======|\r\n|      |        |      |\r\n|      | Title  |      |\r\n|      |        |      |\r\n|======+========+ Icon |\r\n|               |      |\r\n|   My Profile  |      |\r\n|               |      |\r\n\\======================/\r\n-->\r\n<TABLE border=\"0\" width=720px height=430px align=\"center\" cellspacing=\"0\" cellpadding=\"0\" class=\"battle\">\r\n<tr>\r\n<td class=\"b8\" valign=\"top\" rowspan=2>\r\n<div style=\"position:relative;width:140px;height:340px;\">");
  if (r.truth(r.get(r.get(s, "tdata"), "iconImgB"))) {
    await r.write("<IMG src=\"img/");
    await r.write(r.text(r.get(r.get(s, "tdata"), "iconImgB")));
    await r.write("\" style=\"border:0;width:");
    await r.write(r.text(r.get(r.get(s, "tdata"), "iconImgBwidth")));
    await r.write("px;position:absolute;left:");
    await r.write(r.text((await r.call("round", r.divide(r.subtract(140, r.get(r.get(s, "tdata"), "iconImgBwidth")), 2)))));
    await r.write("px;top:0px;");
    if (r.truth(r.equal(r.get(s, "w_hp"), 0))) {
      await r.write("filter: grayscale(100%)");
    }
    await r.write("\" />");
  } else {
    await r.write("<IMG src=\"img/");
    await r.write(r.text(r.get(r.get(s, "tdata"), "iconImg")));
    await r.write("\" style=\"border:0;width:140px;");
    if (r.truth(r.equal(r.get(s, "w_hp"), 0))) {
      await r.write("filter: grayscale(100%)");
    }
    await r.write("\" />");
  }
  await r.write("</div>\r\n</td>\r\n<td colspan=2 width=580px>");
  (await r.include(r.template("MOD_METMAN_ENEMY_PROFILE"), s));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<TD class=\"b8\" height=270px width=440px>\r\n<div style=\"position:relative;height:268px;width:438px;display: flex;align-items:center;justify-content: center;\">");
  if (r.truth((r.truth((await r.call("defined", "MOD_NPCCHAT_BUBBLE"))) && r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "npcchat"))))))))) {
    await r.write("<div style=\"position:absolute;top:0;left:0;display:block;\">");
    await r.write(r.text((await r.module("npcchat_bubble", "npcchat_bubble_show"))));
    await r.write("</div>");
  } else {
    await r.write("<span><B><FONT color=\"#ff0000\" size=\"5\" face=\"黑体\">");
    await r.write(r.text(r.get(s, "battle_title")));
    await r.write("</FONT></B></span>");
  }
  await r.write("</div>\r\n</TD>\r\n<td class=\"b8\" width=140px rowspan=\"2\" valign=\"bottom\">\r\n<div style=\"position:relative;width:140px;height:350px;\">");
  if (r.truth(r.get(s, "iconImgB"))) {
    await r.write("<IMG src=\"img/");
    await r.write(r.text(r.get(s, "iconImgB")));
    await r.write("\" style=\"border:0;width:");
    await r.write(r.text(r.get(s, "iconImgBwidth")));
    await r.write("px;position:absolute;left:");
    await r.write(r.text((await r.call("round", r.divide(r.subtract(140, r.get(s, "iconImgBwidth")), 2)))));
    await r.write("px;bottom:0px;");
    if (r.truth(r.equal(r.get(s, "hp"), 0))) {
      await r.write("filter: grayscale(100%)");
    }
    await r.write("\" />");
  } else {
    await r.write("<IMG src=\"img/");
    await r.write(r.text(r.get(s, "iconImg")));
    await r.write("\" style=\"border:0;width:140px;position:absolute;left:0;bottom:0;");
    if (r.truth(r.equal(r.get(s, "hp"), 0))) {
      await r.write("filter: grayscale(100%)");
    }
    await r.write("\" />");
  }
  await r.write("</div>\r\n</td>\r\n</TR>\r\n<tr>\r\n<td colspan=2 width=580px>");
  (await r.include(r.template("MOD_METMAN_MY_PROFILE"), s));
  await r.write("</td>\r\n</tr>\r\n</table>\r\n");
return 1;
}
