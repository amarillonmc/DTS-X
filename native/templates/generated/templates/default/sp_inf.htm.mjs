// Generated from templates/default/sp_inf.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想要做什么？<br>\r\n\r\n<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" checked><a onclick=sl('menu'); href=\"javascript:void(0);\" >返回</a><br><br>");
  if (r.truth((r.truth((r.truth((r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "h")), false))) || r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "b")), false))))) || r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "a")), false))))) || r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "f")), false))))) && r.truth(r.equal(r.get(s, "club"), 16))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infA\" value=\"infA\"><a onclick=sl('infA'); href=\"javascript:void(0);\" ><span class=\"red b\">包扎全身伤口</span></a><br>");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "b")), false)))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infb\" value=\"infb\"><a onclick=sl('infb'); href=\"javascript:void(0);\" >包扎");
    await r.write(r.text(r.get(r.get(s, "infinfo"), "b")));
    await r.write("<span class=\"red b\">部</span>伤口</a><br>");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "h")), false)))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infh\" value=\"infh\"><a onclick=sl('infh'); href=\"javascript:void(0);\" >包扎");
    await r.write(r.text(r.get(r.get(s, "infinfo"), "h")));
    await r.write("<span class=\"red b\">部</span>伤口</a><br>");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "a")), false)))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infa\" value=\"infa\"><a onclick=sl('infa'); href=\"javascript:void(0);\" >包扎");
    await r.write(r.text(r.get(r.get(s, "infinfo"), "a")));
    await r.write("<span class=\"red b\">部</span>伤口</a><br>");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "f")), false)))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"inff\" value=\"inff\"><a onclick=sl('inff'); href=\"javascript:void(0);\" >包扎");
    await r.write(r.text(r.get(r.get(s, "infinfo"), "f")));
    await r.write("<span class=\"red b\">部</span>伤口</a><br>");
  }
  if (r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "p")), false))) && r.truth(r.equal(r.get(s, "club"), 16))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infp\" value=\"infp\"><a onclick=sl('infp'); href=\"javascript:void(0);\" >治疗");
    await r.write(r.text(r.get(r.get(s, "exdmginf"), "p")));
    await r.write("状态</a><br>");
  }
  if (r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "u")), false))) && r.truth(r.equal(r.get(s, "club"), 16))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infu\" value=\"infu\"><a onclick=sl('infu'); href=\"javascript:void(0);\" >治疗");
    await r.write(r.text(r.get(r.get(s, "exdmginf"), "u")));
    await r.write("状态</a><br>");
  }
  if (r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "i")), false))) && r.truth(r.equal(r.get(s, "club"), 16))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infi\" value=\"infi\"><a onclick=sl('infi'); href=\"javascript:void(0);\" >治疗");
    await r.write(r.text(r.get(r.get(s, "exdmginf"), "i")));
    await r.write("状态</a><br>");
  }
  if (r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "e")), false))) && r.truth(r.equal(r.get(s, "club"), 16))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infe\" value=\"infe\"><a onclick=sl('infe'); href=\"javascript:void(0);\" >治疗");
    await r.write(r.text(r.get(r.get(s, "exdmginf"), "e")));
    await r.write("状态</a><br>");
  }
  if (r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "w")), false))) && r.truth(r.equal(r.get(s, "club"), 16))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"infw\" value=\"infw\"><a onclick=sl('infw'); href=\"javascript:void(0);\" >治疗");
    await r.write(r.text(r.get(r.get(s, "exdmginf"), "w")));
    await r.write("状态</a><br>");
  }
  await r.write(" \r\n\r\n");
return 1;
}
