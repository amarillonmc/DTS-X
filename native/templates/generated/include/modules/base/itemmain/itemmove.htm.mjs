// Generated from include/modules/base/itemmain/itemmove.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("先选择要移位的道具，再选择要移动到的位置。<br>\r\n\r\n<input type=\"hidden\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"menu\">\r\n<br>\r\n将：\r\n<select name=\"from\">\r\n<option value=\"0\">■ 道  具 ■");
  if (r.truth(r.get(s, "itms1"))) {
    await r.write("<option value=\"1\">");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
  }
  if (r.truth(r.get(s, "itms2"))) {
    await r.write("<option value=\"2\">");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
  }
  if (r.truth(r.get(s, "itms3"))) {
    await r.write("<option value=\"3\">");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
  }
  if (r.truth(r.get(s, "itms4"))) {
    await r.write("<option value=\"4\">");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
  }
  if (r.truth(r.get(s, "itms5"))) {
    await r.write("<option value=\"5\">");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
  }
  if (r.truth(r.get(s, "itms6"))) {
    await r.write("<option value=\"6\">");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
  }
  await r.write("</select>\r\n<br>\r\n移动至/与之交换：\r\n<select name=\"to\">\r\n<option value=\"0\">■ 位  置 ■");
  if (r.truth(r.get(s, "itms1"))) {
    await r.write("<option value=\"1\">包裹1：");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
  } else {
    await r.write("<option value=\"1\">包裹1");
  }
  if (r.truth(r.get(s, "itms2"))) {
    await r.write("<option value=\"2\">包裹2：");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
  } else {
    await r.write("<option value=\"2\">包裹2");
  }
  if (r.truth(r.get(s, "itms3"))) {
    await r.write("<option value=\"3\">包裹3：");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
  } else {
    await r.write("<option value=\"3\">包裹3");
  }
  if (r.truth(r.get(s, "itms4"))) {
    await r.write("<option value=\"4\">包裹4：");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
  } else {
    await r.write("<option value=\"4\">包裹4");
  }
  if (r.truth(r.get(s, "itms5"))) {
    await r.write("<option value=\"5\">包裹5：");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
  } else {
    await r.write("<option value=\"5\">包裹5");
  }
  if (r.truth(r.get(s, "itms6"))) {
    await r.write("<option value=\"6\">包裹6：");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
  } else {
    await r.write("<option value=\"6\">包裹6");
  }
  await r.write("</select>\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"$('command').value='itemmove';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]放弃\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
