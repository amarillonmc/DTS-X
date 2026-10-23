// Generated from include/modules/base/wound/wound_picture.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<img id=\"injuerd\" ");
  if (r.truth((r.truth((r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "h")), false))) || r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "b")), false))))) || r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "a")), false))))) || r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "f")), false)))))) {
    await r.write("src=\"img/injured.gif\"");
  } else {
    await r.write("src=\"img/injured2.gif\"");
  }
  await r.write(" style=\"position:absolute;top:0;left:10;width:84;height:20;\">\r\n<img id=\"poisoned\" ");
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "p")), false)))) {
    if (r.truth((r.truth((r.truth(r.equal(r.get(s, "club"), 16)) && r.truth(r.equal(r.constant("CURSCRIPT"), "game")))) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infp';postCmd('gamecmd','command.php');return false;\" ");
    }
    await r.write("src=\"img/p.gif\"");
  } else {
    await r.write("src=\"img/p2.gif\"");
  }
  await r.write(" style=\"position:absolute;top:20;left:4;width:98;height:20;z-index:1;\">\r\n<img id=\"burned\" ");
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "u")), false)))) {
    if (r.truth((r.truth((r.truth(r.equal(r.get(s, "club"), 16)) && r.truth(r.equal(r.constant("CURSCRIPT"), "game")))) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infu';postCmd('gamecmd','command.php');return false;\" ");
    }
    await r.write("src=\"img/u.gif\"");
  } else {
    await r.write("src=\"img/u2.gif\"");
  }
  await r.write(" style=\"position:absolute;top:40;left:11;width:81;height:20;z-index:1;\">\r\n<img id=\"frozen\" ");
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "i")), false)))) {
    if (r.truth((r.truth((r.truth(r.equal(r.get(s, "club"), 16)) && r.truth(r.equal(r.constant("CURSCRIPT"), "game")))) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infi';postCmd('gamecmd','command.php');return false;\" ");
    }
    await r.write("src=\"img/i.gif\"");
  } else {
    await r.write("src=\"img/i2.gif\"");
  }
  await r.write(" style=\"position:absolute;top:60;left:13;width:77;height:20;z-index:1;\">\r\n<img id=\"paralysed\" ");
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "e")), false)))) {
    if (r.truth((r.truth((r.truth(r.equal(r.get(s, "club"), 16)) && r.truth(r.equal(r.constant("CURSCRIPT"), "game")))) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infe';postCmd('gamecmd','command.php');return false;\" ");
    }
    await r.write("src=\"img/e.gif\"");
  } else {
    await r.write("src=\"img/e2.gif\"");
  }
  await r.write(" style=\"position:absolute;top:80;left:2;width:101;height:20;z-index:1;\">\r\n<img id=\"confused\" ");
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "w")), false)))) {
    if (r.truth((r.truth((r.truth(r.equal(r.get(s, "club"), 16)) && r.truth(r.equal(r.constant("CURSCRIPT"), "game")))) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infw';postCmd('gamecmd','command.php');return false;\" ");
    }
    await r.write("src=\"img/w.gif\"");
  } else {
    await r.write("src=\"img/w2.gif\"");
  }
  await r.write(" style=\"position:absolute;top:100;left:3;width:100;height:20;z-index:1;\">");
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "h")), false)))) {
    await r.write("<img id=\"infh\" src=\"img/hurt.gif\" style=\"cursor:pointer;position:absolute;top:0;left:121;width:37;height:37;z-index:1;\" ");
    if (r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infh';postCmd('gamecmd','command.php');return false;\"");
    }
    await r.write(">");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "b")), false)))) {
    await r.write("<img id=\"infb\" src=\"img/hurt.gif\" style=\"cursor:pointer;position:absolute;top:43;left:121;width:37;height:37;z-index:1;\" ");
    if (r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infb';postCmd('gamecmd','command.php');return false;\"");
    }
    await r.write(">");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "a")), false)))) {
    await r.write("<img id=\"infa\" src=\"img/hurt.gif\" style=\"cursor:pointer;position:absolute;top:17;left:102;width:37;height:37;z-index:1;\" ");
    if (r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='infa';postCmd('gamecmd','command.php');return false;\"");
    }
    await r.write(">");
  }
  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), "f")), false)))) {
    await r.write("<img id=\"inff\" src=\"img/hurt.gif\" style=\"cursor:pointer;position:absolute;top:111;left:121;width:37;height:37;z-index:1;\" ");
    if (r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command"))))) {
      await r.write("onclick=\"$('mode').value='special';$('command').value='inff';postCmd('gamecmd','command.php');return false;\"");
    }
    await r.write(">");
  }
return 1;
}
