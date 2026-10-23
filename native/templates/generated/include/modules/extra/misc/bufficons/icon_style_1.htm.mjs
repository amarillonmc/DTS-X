// Generated from include/modules/extra/misc/bufficons/icon_style_1.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<td>\r\n<div class=\"bufficon_style_1\" style=\"position:relative; height:32px; width:32px; margin-right:1px;\">\r\n<span style=\"display:none\">");
  await r.write(r.text(r.get(r.get(s, "para"), "totsec")));
  await r.write("</span>\r\n<span style=\"display:none\">");
  await r.write(r.text(r.get(r.get(s, "para"), "nowsec")));
  await r.write("</span>\r\n<span style=\"display:none\">");
  await r.write(r.text(r.get(r.get(s, "para"), "disappear")));
  await r.write("</span>\r\n<div style=\"position:absolute; filter:alpha(opacity=60); opacity:0.6; \">\r\n<img src=\"img/bufficon-cover.png\">\r\n</div><div style=\"position:absolute;\">\r\n<img\tstyle=\"filter:alpha(opacity=40); opacity:0.4;\" src=\"");
  await r.write(r.text(r.get(s, "src")));
  await r.write("\"\r\nonmouseover=\"\r\n   this.parentNode.nextElementSibling.nextElementSibling.style.top\r\n=  Number(jQuery(this).offset().top-jQuery(window).scrollTop()+35).toString()+'px';\r\n   this.parentNode.nextElementSibling.nextElementSibling.style.left\r\n=  Number(jQuery(this).offset().left-jQuery(window).scrollLeft()).toString()+'px';\r\n   this.parentNode.nextElementSibling.nextElementSibling.style.display='block';\"\r\nonmouseout=\"this.parentNode.nextElementSibling.nextElementSibling.style.display='none';\">\r\n</div><div style=\"position:absolute; top:");
  await r.write(r.text(r.get(s, "wh")));
  await r.write("; overflow:hidden;\">\r\n<div style=\"position:relative; top:-");
  await r.write(r.text(r.get(s, "wh")));
  await r.write(";\">\r\n<img\tsrc=\"");
  await r.write(r.text(r.get(s, "src")));
  await r.write("\" \r\nonmouseover=\"\r\n   this.parentNode.parentNode.nextElementSibling.style.top\r\n=  Number(jQuery(this).offset().top-jQuery(window).scrollTop()+35).toString()+'px';\r\n   this.parentNode.parentNode.nextElementSibling.style.left\r\n=  Number(jQuery(this).offset().left-jQuery(window).scrollLeft()).toString()+'px';\r\n   this.parentNode.parentNode.nextElementSibling.style.display='block';\"\r\nonmouseout=\"this.parentNode.parentNode.nextElementSibling.style.display='none';\">\r\n</div>\r\n</div><div class=\"b3\" style=\"position:fixed; z-index:10; display:none; text-align:left;\">\r\n<div style=\"filter:alpha(opacity=95); opacity:0.95; background-color:#000000\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<span style=\"display:block; margin-left:5px; margin-right:5px;\">\r\n<span>");
  await r.write(r.text(r.get(r.get(s, "para"), "hint")));
  await r.write("<br>\r\n生效时间还剩</span><span>");
  await r.write(r.text(r.get(r.get(s, "para"), "lsec")));
  await r.write("</span>秒\r\n</span>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>");
  (await r.include(r.template("MOD_BUFFICONS_CORNER_TEXT"), s));
  await r.write("</div>\r\n</td>");
return 1;
}
