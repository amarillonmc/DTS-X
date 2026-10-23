// Generated from templates/default/kujipick.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  r.imports(s, "cardbase");
  await r.write("<div class=\"subtitle\" align=\"center\">抽卡</div>\r\n<center>\r\n<div style=\"width:1024px;\">");
  if (r.truth((r.truth(r.equal(0, r.get(s, "ktype"))) || r.truth(r.equal(2, r.get(s, "ktype")))))) {
    await r.write("<div style=\"width:950px; text-align:left\">请随便选一张翻开吧。</div>\r\n<ul style=\"width:1000px;list-style-type:none; \">");
    if (r.truth((await r.call("is_array", r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]]))))) {
      {
        const a0 = r.copy(r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]]));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write("<li style=\"float:left;margin:5px\">\r\n<div style=\"\r\ncursor:pointer; \r\nposition:relative; -moz-border-radius:8px; \r\n-webkit-border-radius:8px;\r\nborder-radius:8px; height:320px; width:240px; overflow:hidden; \r\n\"\r\ntitle=\"点击翻开\">\r\n<img src=\"img/cardback2.png\" class=\"cardback\" onclick=\"$('cardchoice').value=");
          await r.write(r.text(r.get(s, "i")));
          await r.write("; document.flipcard.submit();\"></img>\r\n</div>\r\n</li>");
        }
      }
    }
    await r.write("</ul>\r\n<div style=\"clear:both;\"></div>\r\n<br />\r\n<span class=\"yellow b\">\r\n剩余切糕：<span class=\"evergreen b\">");
    await r.write(r.text(r.get(r.get(s, "udata"), "gold")));
    await r.write("</span></span>\r\n<br />\r\n<br />\r\n</div>\r\n\r\n<p>点击卡片以抽卡</p>\r\n<form method=\"post\" name=\"flipcard\" action=\"kuji.php?type=");
    await r.write(r.text(r.get(s, "ktype")));
    await r.write("\">\r\n<input type=\"hidden\" id=\"cardchoice\" name=\"choice\" value=\"\">\r\n</form>");
  } else {
    if (r.truth(r.equal(3, r.get(s, "ktype")))) {
      await r.write("<div style=\"width:950px; height:24px; text-align:left\">请点击一个卡集来抽取。</div>\r\n<br>\r\n<form method=\"post\" name=\"ktype3\" action=\"kuji.php?type=");
      await r.write(r.text(r.get(s, "ktype")));
      await r.write("\">\r\n<input type=\"hidden\" id=\"packchoice\" name=\"packchoice\" value=\"\">");
      r.assign(r.slot(s, ["pl"]), (await r.module("cardbase", "pack_filter", r.get(s, "packlist"), 1)));
      await r.write("<div>");
      r.assign(r.slot(s, ["title_height"]), 40);
      if (r.truth((await r.call("is_array", r.get(s, "pl"))))) {
        {
          const a1 = r.copy(r.get(s, "pl"));
          for (const [k1, v1] of r.entries(a1)) {
            r.assign(r.slot(s, ["v"]), v1);
            r.assign(r.slot(s, ["packname"]), r.get(s, "v"));
            r.assign(r.slot(s, ["pack_title"]), (r.text((r.text((r.text((r.text("<input type=\"submit\" name=\"enter\" class=\"b_button bc_white pack_title_button\" value=\"") + r.text(r.get(s, "v")))) + r.text("\" onclick=\"$('packchoice').value='"))) + r.text(r.get(s, "v")))) + r.text("'; document.ktype3.submit();\">")));
            (await r.include(r.template("MOD_CARDBASE_PACK_FRAME"), s));
          }
        }
      }
      await r.write("</div>\r\n<br>\r\n<br>\r\n</form>");
    }
  }
  await r.write("</center>\r\n<form method=\"post\" name=\"backindex\" action=\"kujilist.php\">\r\n<input type=\"submit\" name=\"enter\" class=\"b_button bc_white\" value=\"返回选择页面\">\r\n</form>");
  (await r.include(r.template("footer"), s));
return 1;
}
