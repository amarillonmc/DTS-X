// Generated from templates/default/kujiresult.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  r.imports(s, "cardbase");
  r.assign(r.slot(s, ["showpack"]), 1);
  await r.write("<div class=\"subtitle\" align=\"center\">抽卡结果</div>\r\n<script type=\"text/javascript\">\r\n\r\nfunction show_card_and_sleep (i, t) {\r\nif(null!=$('cardbox'+i)) {\r\n$('cardbox'+i).classList.toggle('card_flipped');\r\ni++;\r\nsetTimeout('show_card_and_sleep('+i+','+t+')', t);\r\n}\r\n}\r\n</script>\r\n<center>\r\n<div style=\"width:1024px;\">\r\n<ul style=\"width:1000px;list-style-type:none; \">");
  if (r.truth((await r.call("is_array", r.get(s, "kres"))))) {
    {
      const a0 = r.copy(r.get(s, "kres"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["r"]), v0);
        await r.write("<li style=\"float:left;margin:5px\">");
        if (r.truth((!r.truth(((r.get(s, "i0") != null)))))) {
          r.assign(r.slot(s, ["i0"]), r.get(s, "k"));
        }
        await r.write("<div style=\"\r\nposition:relative;");
        if (r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2))))) {
          await r.write("cursor:pointer; ");
        }
        await r.write("\"");
        if (r.truth((r.truth(((r.get(r.get(s, "ishighlight"), r.get(s, "k")) != null))) && r.truth(r.get(r.get(s, "ishighlight"), r.get(s, "k")))))) {
          await r.write("class=\"card_highlight ");
          if (r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2))))) {
            await r.write("hl_cyan");
          } else {
            if (r.truth(r.equal(r.get(s, "ktype"), 3))) {
              await r.write("hl_purple");
            }
          }
          await r.write("\"");
        }
        if (r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2))))) {
          await r.write("title=\"点击再抽一发\"\r\nonclick=\"window.location.href='kuji.php?type=");
          await r.write(r.text(r.get(s, "ktype")));
          await r.write("';\"");
        }
        await r.write(">");
        r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "cards"), r.get(s, "r")));
        r.assign(r.slot(s, ["nownew"]), r.get(r.get(s, "isnew"), r.get(s, "k")));
        r.assign(r.slot(s, ["nowcard", "blink"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "isblink"), r.get(s, "k"))))))) ? r.get(r.get(s, "isblink"), r.get(s, "k")) : 0));
        await r.write("<div class=\"cardbox\" id=\"cardbox");
        await r.write(r.text(r.get(s, "k")));
        await r.write("\">");
        (await r.include(r.template("MOD_CARDBASE_CARD_BACK_FRONT_BOX"), s));
        await r.write("</div>");
        if (r.truth((r.truth((r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2)))) && r.truth(((r.get(r.get(s, "ishighlight"), r.get(s, "k")) != null))))) && r.truth((!r.truth(r.get(r.get(s, "ishighlight"), r.get(s, "k")))))))) {
          await r.write("<div style=\"position:absolute; top:0px; left:0px; background-color:#000000; \r\nheight:320px; width:240px; \r\nfilter:alpha(opacity=50); -moz-opacity:0.5; opacity:0.5; -khtml-opacity: 0.5;\">\r\n</div>");
        }
        await r.write("</div>\r\n</li>");
      }
    }
  }
  await r.write("</ul>\r\n<div style=\"clear:both;\"></div>\r\n<br />\r\n<span class=\"yellow b\">\r\n剩余切糕：<span class=\"evergreen b\">");
  await r.write(r.text(r.get(r.get(s, "udata"), "gold")));
  await r.write("</span></span>\r\n<br />\r\n<br />\r\n</div>\r\n</div>\r\n</center>");
  if (r.truth((r.compare(r.get(r.get(s, "udata"), "gold"), r.get(r.get(s, "kreq"), r.get(s, "ktype"))) >= 0))) {
    if (r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2))))) {
      await r.write("点击任意卡片可以再抽一发\r\n<br>");
    } else {
      await r.write("<form method=\"post\" name=\"kujiagain\" action=\"kuji.php?type=");
      await r.write(r.text(r.get(s, "ktype")));
      await r.write("\">\r\n<input type=\"submit\" class=\"b_button bc_white\" style=\"width:300px\" name=\"enter\" value=\"再抽一发！\">");
      if (r.truth(((r.get(s, "packchoice") != null)))) {
        await r.write("<input type=\"hidden\" id=\"packchoice\" name=\"packchoice\" value=\"");
        await r.write(r.text(r.get(s, "packchoice")));
        await r.write("\">");
      }
      await r.write("</form>");
    }
  }
  await r.write("<form method=\"post\" name=\"backindex\" action=\"kujilist.php\">\r\n<input type=\"submit\" class=\"b_button bc_white\" name=\"enter\" value=\"返回选择页面\">\r\n</form>\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" \r\nonload=\"setTimeout('show_card_and_sleep (");
  await r.write(r.text(r.get(s, "i0")));
  await r.write(", 100)',200);\" />");
  (await r.include(r.template("footer"), s));
return 1;
}
