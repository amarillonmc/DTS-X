// Generated from templates/default/deathnote.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"deathnote\">\r\n<input type=\"hidden\" name=\"item\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"icon_selected\" name=\"dnicon\" value=\"0\" />");
  if (r.truth(r.equal(r.get(s, "gametype"), 1))) {
    await r.write("<input type=\"hidden\" id=\"forbidden\" value=\"1\">\r\n你发现■DeathNote■跟往常似乎有点不一样。每一页上都印满了<span class=\"red b\">红暮</span>的大头像，没有可以落笔的地方了。<br>\r\n页脚上……似乎有一行留言？<br>\r\n<span class=\"red b\">“红杀是雇你们来扫BUG的，不是雇你们来杀人玩的。这本DN我就收走了。”</span>——红暮<br><br>");
  }
  await r.write("请写下对方的名字（留空为不使用）:<br>\r\n<input size=\"15\" type=\"text\" name=\"dnname\" maxlength=\"15\">\r\n<br>\r\n对方的死因（最多255字，不填为“心脏麻痹”）:<br>\r\n<input size=\"30\" type=\"text\" name=\"dndeath\" maxlength=\"255\">\r\n<br>\r\n对方的性别：");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "female"], [r.APPEND, "male"]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, "female"], [r.APPEND, "male"]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["gn"]), v0);
        r.assign(r.slot(s, ["g"]), r.get(r.get(s, "gn"), "0"));
        r.assign(r.slot(s, ["go"]), (r.truth(r.equal("f", r.get(s, "g"))) ? "m" : "f"));
        await r.write("<input type=\"radio\" id=\"");
        await r.write(r.text(r.get(s, "gn")));
        await r.write("\" name=\"dngender\" onclick=\"if(!$('sel_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("').checked) $('sel_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("').click();userIconMover();\" value=\"");
        await r.write(r.text(r.get(s, "g")));
        await r.write("\" ");
        if (r.truth(r.equal(r.get(s, "g"), "f"))) {
          await r.write("checked");
        }
        await r.write(" />\r\n<a onclick=\"$('");
        await r.write(r.text(r.get(s, "gn")));
        await r.write("').click();\">");
        await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "g"))));
        await r.write("</a>\r\n&nbsp;&nbsp;&nbsp;");
      }
    }
  }
  await r.write("<br>\r\n<br>\r\n对方的相貌:\r\n<br>\r\n<div>\r\n<span class=\"cyan b\">点击头像可展开选择页面</span>\r\n</div><div id=\"userIconImg\" class=\"iconimg\" onclick=\"bubblebox_show('pc_icon_selecting');\">");
  if (r.truth(r.equal(r.get(s, "gametype"), 1))) {
    await r.write("<img src=\"img/n_7.gif\">");
  } else {
    await r.write("<img src=\"img/m_0.gif\">");
  }
  await r.write("</div>\r\n<br>\r\n<div>（注意，deathnote只能对玩家使用。）</div>\r\n<br>");
  if (r.truth(r.equal(r.get(s, "gametype"), 1))) {
    r.assign(r.slot(s, ["icon_list"]), (await r.module("player", "get_pc_icon_selecting_list")));
    r.assign(r.slot(s, ["now_gender"]), "f");
    {
      const a1 = r.copy(r.array([[r.APPEND, "f"], [r.APPEND, "m"]]));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["g"]), v1);
        {
          const a2 = r.get(r.get(s, "icon_list"), r.get(s, "g"));
          for (const [k2, v2] of r.entries(a2)) {
          r.assign(r.slot(s, ["k"]), k2);
            r.bind(r.slot(s, ["v"]), a2, k2);
            r.assign(r.slot(s, ["v", "0"]), "n_7.gif");
          }
        }
      }
    }
    await r.write("没地方落笔了，你要把名字写在红暮脸上吗？<br>\r\n<input type=\"button\" value=\"写！\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" value=\"算了\" onclick=\"$('mode').value='command';postCmd('gamecmd','command.php');this.disabled=true;\">");
  } else {
    await r.write("<input type=\"button\" value=\"提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" value=\"返回\" onclick=\"$('mode').value='command';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
  r.assign(r.slot(s, ["disable_random_icon"]), r.assign(r.slot(s, ["disable_iconImgB"]), 1));
  (await r.call("bubblebox_start", "id:pc_icon_selecting;height:440;width:716;cancellable:1;z-index-base:35;"));
  (await r.include(r.template("pc_icon_selecting"), s));
  (await r.call("bubblebox_end"));
return 1;
}
