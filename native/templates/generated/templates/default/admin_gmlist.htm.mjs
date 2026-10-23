// Generated from templates/default/admin_gmlist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"gmlist\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"gmlist\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n<input type=\"hidden\" id=\"adminuid\" name=\"adminuid\" value=\"\">\r\n<table class=\"admin\">\r\n<tr>\r\n<th>UID</th>\r\n<th width=\"250px\">账号</th>\r\n<th>权限</th>\r\n<th>操作</th>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "gmdata"))))) {
    {
      const a0 = r.copy(r.get(s, "gmdata"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["n"]), k0);
        r.assign(r.slot(s, ["gm"]), v0);
        await r.write("<tr>\r\n<td>");
        await r.write(r.text(r.get(r.get(s, "gm"), "uid")));
        await r.write("</td>\r\n<td>");
        await r.write(r.text(r.get(r.get(s, "gm"), "username")));
        await r.write("</td>\t\r\n<td>");
        if (r.truth((r.compare(r.get(r.get(s, "gm"), "groupid"), r.get(s, "mygroup")) >= 0))) {
          await r.write("<span class=\"red b\">");
          await r.write(r.text(r.get(r.get(s, "gm"), "groupid")));
          await r.write("</span>");
        } else {
          await r.write("<select name=\"");
          await r.write(r.text(r.get(r.get(s, "gm"), "uid")));
          await r.write("_group\">");
          if (r.truth((await r.call("is_array", r.array([[r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6], [r.APPEND, 7], [r.APPEND, 8], [r.APPEND, 9]]))))) {
            {
              const a1 = r.copy(r.array([[r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6], [r.APPEND, 7], [r.APPEND, 8], [r.APPEND, 9]]));
              for (const [k1, v1] of r.entries(a1)) {
                r.assign(r.slot(s, ["i"]), v1);
                await r.write("<option value=\"");
                await r.write(r.text(r.get(s, "i")));
                await r.write("\" ");
                if (r.truth(r.equal(r.get(r.get(s, "gm"), "groupid"), r.get(s, "i")))) {
                  await r.write("selected=\"true\"");
                }
                await r.write(">");
                await r.write(r.text(r.get(s, "i")));
                await r.write("</option>");
              }
            }
          }
          await r.write("</select>");
        }
        await r.write("</td>\t\t\r\n<td>\r\n<input type=\"submit\" value=\"编辑\" ");
        if (r.truth((r.compare(r.get(r.get(s, "gm"), "groupid"), r.get(s, "mygroup")) >= 0))) {
          await r.write("disabled=\"true\"");
        }
        await r.write(" onclick=\"$('command').value='edit';$('adminuid').value='");
        await r.write(r.text(r.get(r.get(s, "gm"), "uid")));
        await r.write("';\">\r\n<input type=\"submit\" value=\"删除\" ");
        if (r.truth((r.compare(r.get(r.get(s, "gm"), "groupid"), r.get(s, "mygroup")) >= 0))) {
          await r.write("disabled=\"true\"");
        }
        await r.write(" onclick=\"$('command').value='del';$('adminuid').value='");
        await r.write(r.text(r.get(r.get(s, "gm"), "uid")));
        await r.write("';\">\r\n</td>\r\n</tr>");
      }
    }
  }
  await r.write("<tr>\r\n<td>新增</td>\r\n<td><input type=\"text\" name=\"addname\" value=\"\" size=\"30\" maxlength=\"15\"></td>\t\r\n<td>\r\n<select name=\"addgroup\">\r\n<option value=\"2\" selected=\"true\">2</option>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6], [r.APPEND, 7], [r.APPEND, 8], [r.APPEND, 9]]))))) {
    {
      const a2 = r.copy(r.array([[r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6], [r.APPEND, 7], [r.APPEND, 8], [r.APPEND, 9]]));
      for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["i"]), v2);
        await r.write("<option value=\"");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\">");
        await r.write(r.text(r.get(s, "i")));
        await r.write("</option>");
      }
    }
  }
  await r.write("</select>\r\n</td>\r\n<td><input type=\"submit\" value=\"新增\" onclick=\"$('command').value='add'\"></td>\r\n</tr>\r\n</table>\r\n</form>\r\n");
return 1;
}
