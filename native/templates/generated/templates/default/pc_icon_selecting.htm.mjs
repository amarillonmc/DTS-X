// Generated from templates/default/pc_icon_selecting.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth(r.get(s, "icon_list"))))) {
    r.assign(r.slot(s, ["icon_list"]), (await r.module("player", "get_pc_icon_selecting_list")));
  }
  if (r.truth((!r.truth(r.get(s, "now_gender"))))) {
    r.assign(r.slot(s, ["now_gender"]), (r.truth((!r.truth((!r.truth(r.get(s, "gender")))))) ? r.get(s, "gender") : (r.truth((!r.truth((!r.truth(r.get(s, "gd")))))) ? r.get(s, "gd") : "f")));
  }
  await r.write("<!--后端把处理过的icon_list数据传到前端供js使用-->");
  r.assign(r.slot(s, ["icon_list_contents_to_frontend"]), (await r.call("get_var_in_module", "icon_list_contents_to_frontend", "player")));
  r.assign(r.slot(s, ["tmp_show"]), (await r.call("json_encode", r.get(s, "icon_list_contents_to_frontend"))));
  await r.write("<div id=\"icon_list_contents_to_frontend\" style=\"display:none\">");
  await r.write(r.text(r.get(s, "tmp_show")));
  await r.write("</div><div style=\"text-align:center;\">\r\n    <div class=\"subtitle\" style=\"text-align:center\">头像选择</div>\r\n    <p>\r\n        ");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "female"], [r.APPEND, "male"]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, "female"], [r.APPEND, "male"]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["gn"]), v0);
        await r.write("            ");
        r.assign(r.slot(s, ["g"]), r.get(r.get(s, "gn"), "0"));
        r.assign(r.slot(s, ["go"]), (r.truth(r.equal("f", r.get(s, "g"))) ? "m" : "f"));
        await r.write("            <input type=\"radio\" id=\"sel_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("\" name=\"dummy\" class=\"radio_comb\" value=\"");
        await r.write(r.text(r.get(s, "g")));
        await r.write("\" \r\n                onclick=\"if(!$('");
        await r.write(r.text(r.get(s, "gn")));
        await r.write("').checked) $('");
        await r.write(r.text(r.get(s, "gn")));
        await r.write("').click();$('icon_list_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("_container').style.display='block';$('icon_list_");
        await r.write(r.text(r.get(s, "go")));
        await r.write("_container').style.display='none';\"\r\n                ");
        if (r.truth(r.equal(r.get(s, "now_gender"), (r.text(r.get(s, "g")))))) {
          await r.write("checked");
        }
        await r.write("            />\r\n            <a onclick=\"$('sel_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("').click();\">\r\n                &nbsp;&nbsp;&nbsp;");
        await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "g"))));
        await r.write("&nbsp;&nbsp;&nbsp;\r\n            </a>\r\n            &nbsp;&nbsp;&nbsp;\r\n        ");
      }
    }
  }
  await r.write("    </p>\r\n    ");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "f"], [r.APPEND, "m"]]))))) {
    {
      const a1 = r.copy(r.array([[r.APPEND, "f"], [r.APPEND, "m"]]));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["g"]), v1);
        await r.write("    <div id=\"icon_list_");
        await r.write(r.text(r.get(s, "g")));
        await r.write("_container\" style=\"width:716px;");
        if (r.truth((!r.equal(r.get(s, "now_gender"), r.get(s, "g"))))) {
          await r.write("display:none");
        }
        await r.write("\">\r\n        ");
        if (r.truth((!r.truth(r.get(s, "disable_random_icon"))))) {
          await r.write("            <span id=\"icon_");
          await r.write(r.text(r.get(s, "g")));
          await r.write("_0_hint\" class=\"b\" onclick=\"$('icon_");
          await r.write(r.text(r.get(s, "g")));
          await r.write("_0').click();\">随机头像</span>\r\n            <img id=\"icon_");
          await r.write(r.text(r.get(s, "g")));
          await r.write("_0\" src=\"img/");
          await r.write(r.text(r.get(s, "g")));
          await r.write("_0.gif\" onclick=\"$('icon_selected').value='0';bubblebox_hide_all();userIconMover();\" />\r\n        ");
        }
        await r.write("        ");
        if (r.truth((await r.call("is_array", r.get(r.get(s, "icon_list"), r.get(s, "g")))))) {
          {
            const a2 = r.copy(r.get(r.get(s, "icon_list"), r.get(s, "g")));
            for (const [k2, v2] of r.entries(a2)) {
            r.assign(r.slot(s, ["i"]), k2);
              r.assign(r.slot(s, ["v"]), v2);
              await r.write("            ");
              if (r.truth(r.get(s, "i"))) {
                await r.write("            <img src=\"img/");
                await r.write(r.text(r.get(r.get(s, "v"), "0")));
                await r.write("\" onclick=\"$('icon_selected').value='");
                await r.write(r.text(r.get(s, "i")));
                await r.write("';bubblebox_hide_all();userIconMover();\" \r\n            ");
                if (r.truth((r.truth(r.get(r.get(s, "v"), "1")) && r.truth((!r.truth(r.get(s, "disable_iconImgB"))))))) {
                  await r.write("title=\"<img src='img/");
                  await r.write(r.text(r.get(r.get(s, "v"), "1")));
                  await r.write("' />\"");
                }
                await r.write(" />\r\n            ");
              }
              await r.write("        ");
            }
          }
        }
        await r.write("    </div>\r\n    ");
      }
    }
  }
  await r.write("</div>");
return 1;
}
