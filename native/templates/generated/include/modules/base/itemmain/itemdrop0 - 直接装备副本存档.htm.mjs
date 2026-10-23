// Generated from include/modules/base/itemmain/itemdrop0 - 直接装备副本存档.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("你的包裹已经满了。想要丢掉哪个物品？<br><br>\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"itemmain\">");
  if (r.truth((r.truth((await r.call("defined", "MOD_SEARCHMEMORY"))) && r.truth((await r.module("searchmemory", "searchmemory_available")))))) {
    await r.write("<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]丢弃\" onclick=\"$('command').value='dropitm0';postCmd('gamecmd','command.php');this.disabled=true;\">");
    await r.write(r.text(r.get(s, "itm0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms0")));
    await r.write("<br><br>\r\n<ul style=\"padding-left:24px;\">\r\n<!-- 需要/itemmain/main.php第389行（可能有变化）取消注释 -->");
    if (r.truth((r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "W")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "D")), 0)))) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "A")), 0))))) {
      if (r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "W")), 0))) {
        await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"swapwep\" ");
        if (r.truth((r.truth(r.get(s, "weps")) && r.truth(r.get(s, "wepe"))))) {
          await r.write("value=\"丢弃装备\" onclick=\"$('command').value='swapwep';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('swapwep').click();>");
          await r.write(r.text(r.get(s, "wep")));
          await r.write("/");
          await r.write(r.text(r.get(s, "wepe")));
          await r.write("/");
          await r.write(r.text(r.get(s, "weps")));
          await r.write("</a></li>");
        } else {
          await r.write("value=\"直接装备\" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\"></li>");
        }
      } else {
        if (r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "DB")), 0))) {
          await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"swaparb\" ");
          if (r.truth((r.truth(r.get(s, "arbs")) && r.truth(r.get(s, "arbe"))))) {
            await r.write("value=\"丢弃装备\" onclick=\"$('command').value='swaparb';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('swaparb').click();>");
            await r.write(r.text(r.get(s, "arb")));
            await r.write("/");
            await r.write(r.text(r.get(s, "arbe")));
            await r.write("/");
            await r.write(r.text(r.get(s, "arbs")));
            await r.write("</a></li>");
          } else {
            await r.write("value=\"直接装备\" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\"></li>");
          }
        } else {
          if (r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "DH")), 0))) {
            await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"swaparh\" ");
            if (r.truth((r.truth(r.get(s, "arhs")) && r.truth(r.get(s, "arhe"))))) {
              await r.write("value=\"丢弃装备\" onclick=\"$('command').value='swaparh';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('swaparh').click();>");
              await r.write(r.text(r.get(s, "arh")));
              await r.write("/");
              await r.write(r.text(r.get(s, "arhe")));
              await r.write("/");
              await r.write(r.text(r.get(s, "arhs")));
              await r.write("</a></li>");
            } else {
              await r.write("value=\"直接装备\" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\"></li>");
            }
          } else {
            if (r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "DA")), 0))) {
              await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"swapara\" ");
              if (r.truth((r.truth(r.get(s, "aras")) && r.truth(r.get(s, "arae"))))) {
                await r.write("value=\"丢弃装备\" onclick=\"$('command').value='swapara';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('swapara').click();>");
                await r.write(r.text(r.get(s, "ara")));
                await r.write("/");
                await r.write(r.text(r.get(s, "arae")));
                await r.write("/");
                await r.write(r.text(r.get(s, "aras")));
                await r.write("</a></li>");
              } else {
                await r.write("value=\"直接装备\" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\"></li>");
              }
            } else {
              if (r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "DF")), 0))) {
                await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"swaparf\" ");
                if (r.truth((r.truth(r.get(s, "arfs")) && r.truth(r.get(s, "arfe"))))) {
                  await r.write("value=\"丢弃装备\" onclick=\"$('command').value='swaparf';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('swaparf').click();>");
                  await r.write(r.text(r.get(s, "arf")));
                  await r.write("/");
                  await r.write(r.text(r.get(s, "arfe")));
                  await r.write("/");
                  await r.write(r.text(r.get(s, "arfs")));
                  await r.write("</a></li>");
                } else {
                  await r.write("value=\"直接装备\" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\"></li>");
                }
              } else {
                if (r.truth(r.identical((await r.call("strpos", r.get(s, "itmk0"), "A")), 0))) {
                  await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"swapart\" ");
                  if (r.truth((r.truth(r.get(s, "arts")) && r.truth(r.get(s, "arte"))))) {
                    await r.write("value=\"丢弃装备\" onclick=\"$('command').value='swapart';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('swapart').click();>");
                    await r.write(r.text(r.get(s, "art")));
                    await r.write("/");
                    await r.write(r.text(r.get(s, "arte")));
                    await r.write("/");
                    await r.write(r.text(r.get(s, "arts")));
                    await r.write("</a></li>");
                  } else {
                    await r.write("value=\"直接装备\" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\"></li>");
                  }
                }
              }
            }
          }
        }
      }
      await r.write("<br>");
    }
    await r.write("<li><input type=\"button\" class=\"dropbutton\" id=\"a\" value=\"[A]丢弃\" onclick=\"$('command').value='swapitm1';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('a').click();>");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("</a></li>\r\n<li><input type=\"button\" class=\"dropbutton\" id=\"s\" value=\"[S]丢弃\" onclick=\"$('command').value='swapitm2';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('s').click();>");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("</a></li>\r\n<li><input type=\"button\" class=\"dropbutton\" id=\"d\" value=\"[D]丢弃\" onclick=\"$('command').value='swapitm3';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('d').click();>");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("</a></li>\r\n<li><input type=\"button\" class=\"dropbutton\" id=\"q\" value=\"[Q]丢弃\" onclick=\"$('command').value='swapitm4';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('q').click();>");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("</a></li>\r\n<li><input type=\"button\" class=\"dropbutton\" id=\"w\" value=\"[W]丢弃\" onclick=\"$('command').value='swapitm5';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('w').click();>");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("</a></li>\r\n<li><input type=\"button\" class=\"dropbutton\" id=\"e\" value=\"[E]丢弃\" onclick=\"$('command').value='swapitm6';postCmd('gamecmd','command.php');this.disabled=true;\"> <a onclick=$('e').click();>");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write("</a></li>\r\n</ul>");
  } else {
    await r.write("<input type=\"radio\" name=\"command\" id=\"dropitm0\" value=\"dropitm0\" checked><a onclick=sl(\"dropitm0\"); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms0")));
    await r.write("</a><br><br>\r\n<input type=\"radio\" name=\"command\" id=\"itm1\" value=\"swapitm1\"><a onclick=sl('itm1'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write(" </a><br>\r\n<input type=\"radio\" name=\"command\" id=\"itm2\" value=\"swapitm2\"><a onclick=sl('itm2'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write(" </a><br>\r\n<input type=\"radio\" name=\"command\" id=\"itm3\" value=\"swapitm3\"><a onclick=sl('itm3'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write(" </a><br>\r\n<input type=\"radio\" name=\"command\" id=\"itm4\" value=\"swapitm4\"><a onclick=sl('itm4'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write(" </a><br>\r\n<input type=\"radio\" name=\"command\" id=\"itm5\" value=\"swapitm5\"><a onclick=sl('itm5'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write(" </a><br>\r\n<input type=\"radio\" name=\"command\" id=\"itm6\" value=\"swapitm6\"><a onclick=sl('itm6'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write(" </a><br>\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]确定\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
