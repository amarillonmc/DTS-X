// Generated from templates/default/admin_adminlogcheck.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div id=\"notice\"></div>\r\n<span class=\"subtitle\">管理员操作记录</span>\r\n<center>\r\n<div id=\"adminlog\">\r\n<TABLE border=\"0\" cellspacing=\"2\" cellpadding=\"0\" style=\"min-width:700px\">\r\n<TR height=\"20\">\r\n<TD class=\"b1\"><span> 时间 </span></TD>\r\n<TD class=\"b1\"><span> 管理员ID </span></TD>\r\n<TD class=\"b1\"><span> 操作 </span></TD>\r\n<TD class=\"b1\"><span> 内容 </span></TD>\r\n<TD class=\"b1\"><span> 局数 </span></TD>\r\n</TR>\r\n        ");
  if (r.truth((await r.call("is_array", r.get(s, "showdata"))))) {
    {
      const a0 = r.copy(r.get(s, "showdata"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["d"]), v0);
        await r.write("        <TR height=\"25\">\r\n        \t<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "d"), "0")));
        await r.write("</span></TD>\r\n            <TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "d"), "1")));
        await r.write("</span></TD>\r\n            <TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "d"), "2")));
        await r.write("</span></TD>\r\n            <TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "d"), "3")));
        await r.write("</span></TD>\r\n            <TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "d"), "4")));
        await r.write("</span></TD>\r\n        </TR>\r\n        ");
      }
    }
  }
  await r.write("</TABLE>\r\n    </div>\r\n<center>");
return 1;
}
