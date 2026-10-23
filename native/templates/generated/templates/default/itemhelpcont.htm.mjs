// Generated from templates/default/itemhelpcont.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["ika"]), (await r.call("array_keys", r.get(s, "iinfo_all"))));
  if (r.truth((await r.call("is_array", r.get(s, "ika"))))) {
    {
      const a0 = r.copy(r.get(s, "ika"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["ii"]), k0);
        r.assign(r.slot(s, ["ikav"]), v0);
        await r.write("<a ");
        if (r.truth(r.equal(r.get(s, "ii"), 0))) {
          await r.write("class=\"lime b\"");
        } else {
          await r.write("class=\"grey b\"");
        }
        await r.write(" id=\"ibtn");
        await r.write(r.text(r.get(s, "ii")));
        await r.write("\" \r\nonclick=\"");
        if (r.truth((await r.call("is_array", r.get(s, "ika"))))) {
          {
            const a1 = r.copy(r.get(s, "ika"));
            for (const [k1, v1] of r.entries(a1)) {
            r.assign(r.slot(s, ["ii2"]), k1);
              r.assign(r.slot(s, ["ikav2"]), v1);
              if (r.truth(r.equal(r.get(s, "ii"), r.get(s, "ii2")))) {
                await r.write("$('ibtn");
                await r.write(r.text(r.get(s, "ii2")));
                await r.write("').className='lime b';$('iinfo");
                await r.write(r.text(r.get(s, "ii2")));
                await r.write("').style.display='block';");
              } else {
                await r.write("$('ibtn");
                await r.write(r.text(r.get(s, "ii2")));
                await r.write("').className='grey b';$('iinfo");
                await r.write(r.text(r.get(s, "ii2")));
                await r.write("').style.display='none';");
              }
            }
          }
        }
        await r.write("\">\r");
        await r.write(r.text(r.get(s, "ikav")));
        await r.write("</a>&nbsp;&nbsp;&nbsp;");
      }
    }
  }
  await r.write("<br><br>");
  r.assign(r.slot(s, ["ii"]), 0);
  if (r.truth((await r.call("is_array", r.get(s, "iinfo_all"))))) {
    {
      const a2 = r.copy(r.get(s, "iinfo_all"));
      for (const [k2, v2] of r.entries(a2)) {
      r.assign(r.slot(s, ["iik"]), k2);
        r.assign(r.slot(s, ["iiv"]), v2);
        await r.write("<div align=\"middle\" id=\"iinfo");
        await r.write(r.text(r.get(s, "ii")));
        await r.write("\" ");
        if (r.truth((r.compare(r.get(s, "ii"), 0) > 0))) {
          await r.write("style=\"display:none\"");
        }
        await r.write(">\r\n<table>\r\n<tr>\r\n<td class=\"b1\" height=20px><span>所在地点</span></td>\r\n<td class=\"b1\"><span>物品名称</span></td>\r\n<td class=\"b1\"><span>物品类型</span></td>\r\n<td class=\"b1\"><span>效/耐</span></td>\r\n<td class=\"b1\"><span>物品属性</span></td>\r\n<td class=\"b1\"><span>刷新时间与数量</span></td>\r\n</tr>");
        if (r.truth((await r.call("is_array", r.get(s, "iiv"))))) {
          {
            const a3 = r.copy(r.get(s, "iiv"));
            for (const [k3, v3] of r.entries(a3)) {
              r.assign(r.slot(s, ["iivc"]), v3);
              await r.write("<tr>\r\n<td class=\"b3\" height=20px><span>");
              await r.write(r.text(r.get(r.get(s, "iivc"), "1")));
              await r.write("</span></td>\r\n<td class=\"b3\"><span>");
              await r.write(r.text(r.get(r.get(s, "iivc"), "3")));
              await r.write("</span></td>\r\n<td class=\"b3\"><span>");
              await r.write(r.text(r.get(r.get(s, "iivc"), "4")));
              await r.write("</span></td>\r\n<td class=\"b3\"><span>");
              await r.write(r.text(r.get(r.get(s, "iivc"), "5")));
              await r.write("/");
              await r.write(r.text(r.get(r.get(s, "iivc"), "6")));
              await r.write("</span></td>\r\n<td class=\"b3\"><span>");
              await r.write(r.text(r.get(r.get(s, "iivc"), "7")));
              await r.write("</span></td>\r\n<td class=\"b3\"><span>");
              await r.write(r.text(r.get(r.get(s, "iivc"), "0")));
              await r.write("</span></td>\r\n</tr>");
            }
          }
        }
        await r.write("</table>\r\n</div>");
        r.post(r.slot(s, ["ii"]), 1);
      }
    }
  }
return 1;
}
