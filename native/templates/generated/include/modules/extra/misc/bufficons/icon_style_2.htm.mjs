// Generated from include/modules/extra/misc/bufficons/icon_style_2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<td>\r\n<div class=\"bufficon_style_2\" style=\"position:relative; height:32px; width:32px; margin-right:1px;\">\r\n<span style=\"display:none\">");
  await r.write(r.text(r.get(r.get(s, "para"), "totsec")));
  await r.write("</span>\r\n<span style=\"display:none\">");
  await r.write(r.text(r.get(r.get(s, "para"), "nowsec")));
  await r.write("</span>\r\n<div><div style=\"position:absolute; display:none;\">\r\n<div style=\"position:absolute;\">\r\n<img src=\"");
  await r.write(r.text(r.get(s, "src")));
  await r.write("\" style=\"cursor:pointer;\" \r\nonmouseover=\"\r\n   this.parentNode.parentNode.nextElementSibling.style.top\r\n=  Number(jQuery(this).offset().top-jQuery(window).scrollTop()+35).toString()+'px';\r\n   this.parentNode.parentNode.nextElementSibling.style.left\r\n=  Number(jQuery(this).offset().left-jQuery(window).scrollLeft()).toString()+'px';\r\n   this.parentNode.parentNode.nextElementSibling.style.display='block';\"\r\nonmouseout=\"this.parentNode.parentNode.nextElementSibling.style.display='none';\"");
  if (r.truth(r.get(r.get(s, "para"), "clickable"))) {
    await r.write("onclick=\"");
    await r.write(r.text(r.get(r.get(s, "para"), "onclick")));
    await r.write("\"");
  }
  await r.write(">\r\n</div>");
  if (r.truth((!r.truth(r.get(r.get(s, "para"), "clickable"))))) {
    await r.write("<div style=\"position:absolute; filter:alpha(opacity=60); opacity:0.6; \">\r\n<img src=\"img/bufficon-cover.png\" \r\nonmouseover=\"\r\n   this.parentNode.parentNode.nextElementSibling.style.top\r\n=  Number(jQuery(this).offset().top-jQuery(window).scrollTop()+35).toString()+'px';\r\n   this.parentNode.parentNode.nextElementSibling.style.left\r\n=  Number(jQuery(this).offset().left-jQuery(window).scrollLeft()).toString()+'px';\r\n   this.parentNode.parentNode.nextElementSibling.style.display='block';\"\r\nonmouseout=\"this.parentNode.parentNode.nextElementSibling.style.display='none';\"\r\n>\r\n</div>");
  } else {
    await r.write("<div style=\"position:absolute;\"></div>");
  }
  await r.write("</div><div class=\"b3\" style=\"position:fixed; z-index:10; display:none; text-align:left;\">\r\n<div style=\"filter:alpha(opacity=95); opacity:0.95; background-color:#000000\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<span style=\"display:block; margin-left:5px; margin-right:5px;\">\r");
  await r.write(r.text(r.get(r.get(s, "para"), "activate_hint")));
  await r.write("</span>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</div>\r\n</div><div>\r\n<div style=\"position:absolute; filter:alpha(opacity=50); opacity:0.5; \">\r\n<img src=\"");
  await r.write(r.text(r.get(s, "src")));
  await r.write("\">\r\n</div><div style=\"position:absolute; height:");
  await r.write(r.text(r.get(s, "wh")));
  await r.write("; overflow:hidden;\">\r\n<img src=\"");
  await r.write(r.text(r.get(s, "src")));
  await r.write("\">\r\n</div><div style=\"position:absolute; filter:alpha(opacity=60); opacity:0.6; \">\r\n<img src=\"img/bufficon-cover.png\" \r\nonmouseover=\"\r\n   this.parentNode.nextElementSibling.style.top\r\n=  Number(jQuery(this).offset().top-jQuery(window).scrollTop()+35).toString()+'px';\r\n   this.parentNode.nextElementSibling.style.left\r\n=  Number(jQuery(this).offset().left-jQuery(window).scrollLeft()).toString()+'px';\r\n   this.parentNode.nextElementSibling.style.display='block';\"\r\nonmouseout=\"this.parentNode.nextElementSibling.style.display='none';\">\r\n</div><div class=\"b3\" style=\"position:fixed; z-index:10; display:none; text-align:left;\">\r\n<div style=\"filter:alpha(opacity=95); opacity:0.95; background-color:#000000\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<span style=\"display:block; margin-left:5px; margin-right:5px;\">");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "para"), "cooling_hint"))))))) {
    await r.write(r.text(r.get(r.get(s, "para"), "cooling_hint")));
  } else {
    await r.write("<span>冷却时间还剩</span><span>");
    await r.write(r.text(r.get(r.get(s, "para"), "lsec")));
    await r.write("</span>秒");
  }
  await r.write("</span>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</div>\r\n</div>");
  (await r.include(r.template("MOD_BUFFICONS_CORNER_TEXT"), s));
  await r.write("</div>\r\n</td>");
return 1;
}
