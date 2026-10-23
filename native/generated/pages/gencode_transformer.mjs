// Static native page from gencode_transformer.php. Build-only source translation.
export default async function execute(r, s) {
  {
    const static0 = Object.create(null);
    r.defineLocal("real_ip", async (...args) => {
      const s = Object.create(null);
      if (!Object.hasOwn(static0, "realip")) r.assign(r.slot(static0, ["realip"]), null);
      r.bind(r.slot(s, ["realip"]), static0, "realip");
      if (r.truth((!r.identical(r.get(s, "realip"), null)))) {
        return r.copy(r.get(s, "realip"));
      }
      if (r.truth(((r.get(r.globals, "_SERVER") != null)))) {
        if (r.truth(((r.get(r.get(r.globals, "_SERVER"), "HTTP_X_FORWARDED_FOR") != null)))) {
          r.assign(r.slot(s, ["arr"]), (await r.call("explode", ",", r.get(r.get(r.globals, "_SERVER"), "HTTP_X_FORWARDED_FOR"))));
          {
            const a2 = r.copy(r.get(s, "arr"));
            loop1: for (const [k2, v2] of r.entries(a2)) {
              r.assign(r.slot(s, ["ip"]), v2);
              r.assign(r.slot(s, ["ip"]), (await r.call("trim", r.get(s, "ip"))));
              if (r.truth((!r.equal(r.get(s, "ip"), "unknown")))) {
                r.assign(r.slot(s, ["realip"]), r.get(s, "ip"));
                break loop1;
              }
            }
          }
        } else {
          if (r.truth(((r.get(r.get(r.globals, "_SERVER"), "HTTP_CLIENT_IP") != null)))) {
            r.assign(r.slot(s, ["realip"]), r.get(r.get(r.globals, "_SERVER"), "HTTP_CLIENT_IP"));
          } else {
            if (r.truth(((r.get(r.get(r.globals, "_SERVER"), "HTTP_CF_CONNECTING_IP") != null)))) {
              r.assign(r.slot(s, ["realip"]), r.get(r.get(r.globals, "_SERVER"), "HTTP_CF_CONNECTING_IP"));
            } else {
              if (r.truth(((r.get(r.get(r.globals, "_SERVER"), "REMOTE_ADDR") != null)))) {
                r.assign(r.slot(s, ["realip"]), r.get(r.get(r.globals, "_SERVER"), "REMOTE_ADDR"));
              } else {
                r.assign(r.slot(s, ["realip"]), "0.0.0.0");
              }
            }
          }
        }
      } else {
        if (r.truth((await r.call("getenv", "HTTP_X_FORWARDED_FOR")))) {
          r.assign(r.slot(s, ["realip"]), (await r.call("getenv", "HTTP_X_FORWARDED_FOR")));
        } else {
          if (r.truth((await r.call("getenv", "HTTP_CLIENT_IP")))) {
            r.assign(r.slot(s, ["realip"]), (await r.call("getenv", "HTTP_CLIENT_IP")));
          } else {
            r.assign(r.slot(s, ["realip"]), (await r.call("getenv", "REMOTE_ADDR")));
          }
        }
      }
      (await r.match("/[\\d\\.]{7,15}/", r.get(s, "realip"), r.argument(r.slot(s, ["onlineip"])), 0, 0, false));
      r.assign(r.slot(s, ["realip"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "onlineip"), 0)))))) ? r.get(r.get(s, "onlineip"), 0) : "0.0.0.0"));
      return r.copy(r.get(s, "realip"));
      return null;
    });
  }
  {
    const static3 = Object.create(null);
    r.defineLocal("encode_achievements", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "aarr", args.length > 0 ? args[0] : null, false);
    r.parameter(s, "old_version", args.length > 1 ? args[1] : 0, false);
      if (r.truth((!r.truth(r.get(s, "old_version"))))) {
        return r.copy((await r.pageCall("gencode", r.get(s, "aarr"))));
      } else {
        return r.copy((await r.call("encode_achievements_o", r.get(s, "aarr"))));
      }
      return null;
    });
  }
  {
    const static4 = Object.create(null);
    r.defineLocal("decode_achievements", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "udata", args.length > 0 ? args[0] : null, false);
      if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "udata"), "u_achievements"))))))) {
        return r.copy((await r.pageCall("gdecode", r.get(r.get(s, "udata"), "u_achievements"), 1)));
      } else {
        return r.copy((await r.call("decode_achievements_o", r.get(r.get(s, "udata"), "n_achievements"))));
      }
      return null;
    });
  }
  {
    const static5 = Object.create(null);
    r.defineLocal("mgzdecode", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "data", args.length > 0 ? args[0] : null, false);
      return r.copy((await r.call("gzinflate", (await r.call("substr", r.get(s, "data"), 10, (-r.number(8)))))));
      return null;
    });
  }
  {
    const static6 = Object.create(null);
    r.defineLocal("gencode", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "para", args.length > 0 ? args[0] : null, false);
      return r.copy((await r.call("base64_encode", (await r.call("gzencode", (await r.call("json_encode", r.get(s, "para"))))))));
      return null;
    });
  }
  {
    const static7 = Object.create(null);
    r.defineLocal("gdecode", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "para", args.length > 0 ? args[0] : null, false);
    r.parameter(s, "assoc", args.length > 1 ? args[1] : false, false);
      r.assign(r.slot(s, ["assoc"]), (r.truth(r.get(s, "assoc")) ? true : false));
      if (r.truth((!r.truth(r.get(s, "para"))))) {
        return r.copy(r.array([]));
      } else {
        return r.copy((await r.call("json_decode", (await r.pageCall("mgzdecode", (await r.call("base64_decode", r.get(s, "para"))))), r.get(s, "assoc"))));
      }
      return null;
    });
  }
  if (r.truth((!r.equal("127.0.0.1", (await r.pageCall("real_ip")))))) {
    await r.write(r.text("不支持在非开发环境下运行！"));
    r.exit(null);
  }
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(r.globals, "_GET"), "method")))))) && r.truth((!r.truth((!r.truth(r.get(r.get(r.globals, "_GET"), "trans"))))))))) {
    if (r.truth(r.equal("gencode", r.get(r.get(r.globals, "_GET"), "method")))) {
      r.assign(r.slot(s, ["show"]), (await r.pageCall("gencode", r.get(r.get(r.globals, "_GET"), "trans"))));
    } else {
      if (r.truth(r.equal("gdecode", r.get(r.get(r.globals, "_GET"), "method")))) {
        r.assign(r.slot(s, ["show"]), (await r.pageCall("gdecode", r.get(r.get(r.globals, "_GET"), "trans"))));
        if (r.truth((!r.truth((await r.call("is_string", r.get(s, "show"))))))) {
          r.assign(r.slot(s, ["show"]), (await r.call("var_export", r.get(s, "show"), 1)));
        }
      }
    }
  }
  if (r.truth((!r.truth(r.get(s, "show"))))) {
    r.assign(r.slot(s, ["show"]), "请输入要转换的字符串");
  }
  await r.write("<form id=\"form\">\r\n\t<fieldset>\r\n\t\t转换结果：<input type=\"text\" size=\"60\" value=\"");
  await r.write(r.text(r.get(s, "show")));
  await r.write("\" name=\"trans\"/><br />\r\n\t\t<input type=\"hidden\" id=\"method\" name=\"method\" value=\"gencode\" />\r\n\t\t<input type=\"button\" value=\"编码\" onclick=\"document.getElementById('method').value='gencode';document.getElementById('form').submit();\"/>\r\n\t\t<input type=\"button\" value=\"解码\" onclick=\"document.getElementById('method').value='gdecode';document.getElementById('form').submit();\"/>\r\n\t</fieldset>\r\n</form>");
  return null;
}
