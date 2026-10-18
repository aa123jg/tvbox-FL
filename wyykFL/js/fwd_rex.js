/**
 * fwd_rex.js — WebHTV(影视TV / WebHomeTV)点播源：Forward / Rex 模块（WidgetMetadata）适配器
 *
 * 把 https://fwd.uou.qzz.io/widgets.rex（或 .fwd / 任意单个 *.js 模块）里的 Forward 模块脚本
 * 在 WebHTV 的 QuickJS 运行时里跑起来，映射成影视TV点播契约（home / category / detail / search / play）。
 *
 * ── 站点配置样例 ─────────────────────────────────────────────────────────
 * 单个模块（推荐，25 个站点各一条）：
 *   { "key":"fwd_missav", "name":"MissAV", "type":3, "api":"./fwd_rex.js",
 *     "ext": { "url": "https://fwd.uou.qzz.io/widgets/MissAV_TuT.js" },
 *     "searchable":1, "quickSearch":1, "changeable":1 }
 * 整包聚合（一个站点 25 个分类）：
 *   { "key":"fwd_all", "name":"宝宝巴士乐园", "type":3, "api":"./fwd_rex.js",
 *     "ext": { "sub": "https://fwd.uou.qzz.io/widgets.rex" },
 *     "searchable":1, "quickSearch":1, "changeable":1 }
 *
 * ── ext 选项 ─────────────────────────────────────────────────────────────
 *   url          单个 widget JS 地址
 *   sub          订阅清单地址（.rex / .fwd，含 widgets[]）；未给 url / widgets 时默认宝宝巴士 .rex
 *   widgets      一组 widget JS 地址（数组）
 *   extra        额外合并进每次模块调用的参数对象
 *   maxSearch    聚合搜索最多查几个 widget，默认 10
 *   timeout      HTTP 超时毫秒，默认 20000
 *   headers      额外请求头
 *
 * ── 运行时假定（WebHTV QuickJS）──────────────────────────────────────────
 *   req(url, options)  同步请求，返回 { code, headers, content }
 *   local.get/set/delete(rule, key[, value])   持久化
 *   站点方法可以返回 Promise（Async.java 会 then 它），所以本文件全部方法都是 async。
 *   注意：HTTP 一律走同步 req()，绝不用运行时那个把回调丢回单线程执行器的异步 http()，
 *        否则会和自己所在的执行器互相等待。
 */

const DEFAULT_SUB = "https://fwd.uou.qzz.io/widgets.rex";
const UA =
  "Mozilla/5.0 (Linux; Android 13; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/* =========================================================================
 * 0. 基础工具
 * ========================================================================= */

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function utf8Bytes(str) {
  const s = String(str == null ? "" : str);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = s.charCodeAt(++i);
      const cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

function utf8String(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    if (b < 0x80) {
      out += String.fromCharCode(b);
      i++;
    } else if (b < 0xe0) {
      out += String.fromCharCode(((b & 31) << 6) | (bytes[i + 1] & 63));
      i += 2;
    } else if (b < 0xf0) {
      out += String.fromCharCode(((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63));
      i += 3;
    } else {
      const cp = ((b & 7) << 18) | ((bytes[i + 1] & 63) << 12) | ((bytes[i + 2] & 63) << 6) | (bytes[i + 3] & 63);
      const v = cp - 0x10000;
      out += String.fromCharCode(0xd800 + (v >> 10), 0xdc00 + (v & 1023));
      i += 4;
    }
  }
  return out;
}

function b64urlEncode(str) {
  const bytes = utf8Bytes(str);
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | ((b1 || 0) >> 4)];
    if (b1 === undefined) break;
    out += B64[((b1 & 15) << 2) | ((b2 || 0) >> 6)];
    if (b2 === undefined) break;
    out += B64[b2 & 63];
  }
  return out;
}

function b64urlDecode(str) {
  const s = String(str || "").replace(/[^A-Za-z0-9_-]/g, "");
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < s.length; i++) {
    const v = B64.indexOf(s[i]);
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 255);
    }
  }
  return utf8String(bytes);
}

function b64Standard(str) {
  return b64urlEncode(str).split("-").join("+").split("_").join("/");
}

function trimSpace(v) {
  return String(v == null ? "" : v).replace(/^\s+|\s+$/g, "");
}

function firstOf() {
  for (let i = 0; i < arguments.length; i++) {
    const v = arguments[i];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return "";
}

function encodeQuery(params) {
  const parts = [];
  if (!params) return "";
  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = params[k];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (let j = 0; j < v.length; j++) parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v[j]));
    } else parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
  }
  return parts.join("&");
}

function safeJson(text) {
  if (typeof text !== "string") return text;
  const t = trimSpace(text);
  if (!t) return "";
  const c = t.charAt(0);
  if (c !== "{" && c !== "[") return text;
  try {
    return JSON.parse(t);
  } catch (e) {
    return text;
  }
}

/* =========================================================================
 * 1. 极简 DOM：HTML 解析 + jQuery 风格 $
 *    widget 只用到 tag / .class / #id / [attr] / [attr=v] / [attr*=v] / [attr^=v]
 *    / [attr$=v]，后代选择器与逗号分组；方法 attr/text/find/first/each/toArray/html
 * ========================================================================= */

const VOID_TAGS = {
  area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1,
  link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1, basefont: 1, isindex: 1,
};

function findTagEnd(html, from) {
  let quote = "";
  for (let i = from + 1; i < html.length; i++) {
    const ch = html.charAt(i);
    if (quote) {
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ">") return i;
  }
  return -1;
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) {
    const name = String(m[1] || "").toLowerCase();
    if (!name) continue;
    const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : "";
    if (attrs[name] === undefined) attrs[name] = value;
  }
  return attrs;
}

function parseHtml(html) {
  const root = { kind: "el", tag: "#root", attrs: {}, children: [], parent: null };
  const source = String(html == null ? "" : html);
  const stack = [root];
  let i = 0;
  const n = source.length;

  const addText = (text) => {
    if (text === "") return;
    const parent = stack[stack.length - 1];
    const last = parent.children[parent.children.length - 1];
    if (last && last.kind === "text") last.text += text;
    else parent.children.push({ kind: "text", text: text, parent: parent, children: [] });
  };

  while (i < n) {
    const lt = source.indexOf("<", i);
    if (lt < 0) {
      addText(source.slice(i));
      break;
    }
    if (lt > i) addText(source.slice(i, lt));

    if (source.substr(lt, 4) === "<!--") {
      const end = source.indexOf("-->", lt + 4);
      i = end < 0 ? n : end + 3;
      continue;
    }
    if (source.charAt(lt + 1) === "!") {
      const gt = source.indexOf(">", lt);
      i = gt < 0 ? n : gt + 1;
      continue;
    }
    const gt = findTagEnd(source, lt);
    if (gt < 0) {
      addText(source.slice(lt));
      break;
    }
    const raw = source.slice(lt + 1, gt);
    i = gt + 1;

    if (raw.charAt(0) === "/") {
      const name = trimSpace(raw.slice(1)).toLowerCase();
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tag === name) {
          stack.length = k;
          break;
        }
      }
      continue;
    }

    const mm = /^([a-zA-Z][^\s\/>]*)([\s\S]*)$/.exec(raw);
    if (!mm) continue;
    const tag = mm[1].toLowerCase();
    const node = { kind: "el", tag: tag, attrs: parseAttrs(mm[2]), children: [], parent: stack[stack.length - 1] };
    node.parent.children.push(node);

    if (/\/\s*$/.test(raw) || VOID_TAGS[tag] === 1) continue;

    if (tag === "script" || tag === "style") {
      const closeIdx = source.toLowerCase().indexOf("</" + tag, i);
      const inner = closeIdx < 0 ? source.slice(i) : source.slice(i, closeIdx);
      if (inner) node.children.push({ kind: "text", text: inner, parent: node, children: [] });
      if (closeIdx < 0) i = n;
      else {
        const g2 = source.indexOf(">", closeIdx);
        i = g2 < 0 ? n : g2 + 1;
      }
      continue;
    }
    stack.push(node);
  }
  return root;
}

function nodeText(node) {
  if (!node) return "";
  if (node.kind === "text") return node.text;
  let out = "";
  for (let i = 0; i < node.children.length; i++) out += nodeText(node.children[i]);
  return out;
}

function innerHtml(node) {
  if (!node) return "";
  if (node.kind === "text") return node.text;
  let out = "";
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    out += c.kind === "text" ? c.text : outerHtml(c);
  }
  return out;
}

function outerHtml(node) {
  if (node.kind === "text") return node.text;
  let attrs = "";
  const keys = Object.keys(node.attrs);
  for (let i = 0; i < keys.length; i++) attrs += " " + keys[i] + '="' + node.attrs[keys[i]] + '"';
  return "<" + node.tag + attrs + ">" + innerHtml(node) + "</" + node.tag + ">";
}

function collectElements(root, out) {
  const acc = out || [];
  for (let i = 0; i < root.children.length; i++) {
    const c = root.children[i];
    if (c.kind !== "el") continue;
    acc.push(c);
    collectElements(c, acc);
  }
  return acc;
}

function splitGroups(selector) {
  const groups = [];
  let cur = "";
  let quote = "";
  let depth = 0;
  const s = String(selector || "");
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    if (quote) {
      cur += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "[" || ch === "(") depth++;
    if (ch === "]" || ch === ")") depth--;
    if (ch === "," && depth === 0) {
      groups.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  groups.push(cur);
  const out = [];
  for (let i = 0; i < groups.length; i++) {
    const g = trimSpace(groups[i]);
    if (g) out.push(g.split(/\s+/));
  }
  return out;
}

function parseCompound(text) {
  const compound = { tag: "", id: "", classes: [], attrs: [] };
  const re = /(\*|[a-zA-Z][\w-]*)|#([\w-]+)|\.([\w-]+)|\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1]) {
      if (m[1] !== "*" && !compound.tag) compound.tag = m[1].toLowerCase();
    } else if (m[2]) compound.id = m[2];
    else if (m[3]) compound.classes.push(m[3]);
    else if (m[4] !== undefined) {
      const am = /^([\w:-]+)\s*(?:([*^$~|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\s*[iIsS]?$/.exec(m[4]);
      if (am) {
        compound.attrs.push({
          name: am[1].toLowerCase(),
          op: am[2] || "",
          value: am[3] !== undefined ? am[3] : am[4] !== undefined ? am[4] : am[5] !== undefined ? trimSpace(am[5]) : "",
        });
      } else compound.attrs.push({ name: trimSpace(m[4]).toLowerCase(), op: "", value: "" });
    }
  }
  return compound;
}

function matchCompound(node, compound) {
  if (!node || node.kind !== "el") return false;
  if (compound.tag && node.tag !== compound.tag) return false;
  if (compound.id && String(node.attrs.id || "") !== compound.id) return false;
  if (compound.classes.length) {
    const cls = " " + String(node.attrs["class"] || "") + " ";
    for (let i = 0; i < compound.classes.length; i++) {
      if (cls.indexOf(" " + compound.classes[i] + " ") < 0) return false;
    }
  }
  for (let i = 0; i < compound.attrs.length; i++) {
    const a = compound.attrs[i];
    const value = node.attrs[a.name];
    if (value === undefined) return false;
    if (!a.op) continue;
    const v = String(value);
    const t = String(a.value);
    if (a.op === "=" && v !== t) return false;
    if (a.op === "*=" && v.indexOf(t) < 0) return false;
    if (a.op === "^=" && v.indexOf(t) !== 0) return false;
    if (a.op === "$=" && (t === "" || v.lastIndexOf(t) !== v.length - t.length)) return false;
    if (a.op === "~=" && (" " + v + " ").indexOf(" " + t + " ") < 0) return false;
    if (a.op === "|=" && v !== t && v.indexOf(t + "-") !== 0) return false;
  }
  return true;
}

function matchChain(node, parts) {
  if (!matchCompound(node, parts[parts.length - 1])) return false;
  let cursor = node;
  for (let p = parts.length - 2; p >= 0; p--) {
    cursor = cursor.parent;
    while (cursor && cursor.kind === "el" && !matchCompound(cursor, parts[p])) cursor = cursor.parent;
    if (!cursor || cursor.kind !== "el") return false;
  }
  return true;
}

function queryNodes(root, selector) {
  const groups = splitGroups(selector).map((parts) => parts.map(parseCompound));
  if (!groups.length) return [];
  const all = collectElements(root);
  const out = [];
  for (let g = 0; g < groups.length; g++) {
    const parts = groups[g];
    for (let i = 0; i < all.length; i++) {
      const node = all[i];
      if (out.indexOf(node) >= 0) continue;
      if (matchChain(node, parts)) out.push(node);
    }
  }
  return out;
}

function createQuery(root) {
  const build = (nodes) => {
    const api = function (sel) {
      if (sel === undefined || sel === null) return build([]);
      if (typeof sel === "string") {
        const text = trimSpace(sel);
        if (text.charAt(0) === "<") {
          const nodes2 = queryNodes(parseHtml(text), "*");
          return build(nodes2);
        }
        return build(queryNodes(root, text));
      }
      if (sel.kind) return build([sel]);
      if (Array.isArray(sel)) return build(sel);
      return build([]);
    };
    // 注意：函数对象的 length 不可写，必须用 defineProperty
    try {
      Object.defineProperty(api, "length", { value: nodes.length, configurable: true });
    } catch (e) {}
    api.each = function (fn) {
      for (let i = 0; i < nodes.length; i++) fn.call(nodes[i], i, nodes[i]);
      return api;
    };
    api.attr = function (name, value) {
      const key = String(name).toLowerCase();
      if (value === undefined) {
        const node = nodes[0];
        if (!node) return undefined;
        return node.attrs[key];
      }
      for (let i = 0; i < nodes.length; i++) nodes[i].attrs[key] = String(value);
      return api;
    };
    api.removeAttr = function (name) {
      const key = String(name).toLowerCase();
      for (let i = 0; i < nodes.length; i++) delete nodes[i].attrs[key];
      return api;
    };
    api.text = function () {
      let out = "";
      for (let i = 0; i < nodes.length; i++) out += nodeText(nodes[i]);
      return out;
    };
    api.html = function () {
      return nodes[0] ? innerHtml(nodes[0]) : "";
    };
    api.find = function (sel) {
      const acc = [];
      for (let i = 0; i < nodes.length; i++) {
        const found = queryNodes(nodes[i], sel);
        for (let j = 0; j < found.length; j++) if (acc.indexOf(found[j]) < 0) acc.push(found[j]);
      }
      return build(acc);
    };
    api.filter = function (fn) {
      const acc = [];
      for (let i = 0; i < nodes.length; i++) if (fn.call(nodes[i], i, nodes[i])) acc.push(nodes[i]);
      return build(acc);
    };
    api.first = function () {
      return build(nodes.slice(0, 1));
    };
    api.last = function () {
      return build(nodes.slice(-1));
    };
    api.eq = function (i) {
      const idx = i < 0 ? nodes.length + i : i;
      return build(nodes.slice(idx, idx + 1));
    };
    api.get = function (i) {
      return i === undefined ? nodes.slice() : nodes[i < 0 ? nodes.length + i : i];
    };
    api.toArray = function () {
      return nodes.slice();
    };
    api.is = function (sel) {
      const parts = splitGroups(sel).map((p) => p.map(parseCompound));
      for (let i = 0; i < nodes.length; i++) {
        for (let g = 0; g < parts.length; g++) if (matchChain(nodes[i], parts[g])) return true;
      }
      return false;
    };
    api.val = function () {
      const v = api.attr("value");
      return v === undefined ? "" : v;
    };
    api.parent = function () {
      const acc = [];
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i].parent;
        if (p && acc.indexOf(p) < 0) acc.push(p);
      }
      return build(acc);
    };
    api.children = function () {
      const acc = [];
      for (let i = 0; i < nodes.length; i++) {
        const kids = nodes[i].children;
        for (let j = 0; j < kids.length; j++) {
          if (kids[j].kind === "el" && acc.indexOf(kids[j]) < 0) acc.push(kids[j]);
        }
      }
      return build(acc);
    };
    return api;
  };
  return build;
}

function htmlLoad(html) {
  const root = parseHtml(html);
  const $ = createQuery(root);
  const wrapped = function (sel) {
    return $(sel);
  };
  wrapped.root = root;
  wrapped.load = htmlLoad;
  wrapped.html = () => innerHtml(root);
  wrapped.text = () => nodeText(root);
  wrapped.find = (sel) => $(sel);
  wrapped.parse = (text) => parseHtml(text);
  return wrapped;
}

/* =========================================================================
 * 2. HTTP —— 只用同步 req()，避免单线程执行器自锁
 * ========================================================================= */

function runtimeReq(url, options) {
  if (typeof req === "function") return req(url, options);
  if (typeof globalThis !== "undefined" && typeof globalThis.req === "function") return globalThis.req(url, options);
  if (typeof http === "function") return http(url, Object.assign({ async: false }, options));
  throw new Error("运行时未提供 req()");
}

function contentTypeOf(headers) {
  if (!headers) return "";
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === "content-type") {
      const v = headers[keys[i]];
      return Array.isArray(v) ? String(v[0]) : String(v);
    }
  }
  return "";
}

function hasHeader(headers, name) {
  const keys = Object.keys(headers || {});
  for (let i = 0; i < keys.length; i++) if (keys[i].toLowerCase() === name) return true;
  return false;
}

function responseOf(raw, url) {
  const code = raw && raw.code !== undefined && raw.code !== "" ? raw.code : 0;
  const headers = (raw && raw.headers) || {};
  let data = raw ? raw.content : "";
  const ct = contentTypeOf(headers).toLowerCase();
  if (typeof data === "string" && (ct.indexOf("json") >= 0 || /^\s*[{[]/.test(data))) data = safeJson(data);
  return {
    ok: code >= 200 && code < 400,
    status: code,
    code: code,
    data: data,
    headers: headers,
    url: url,
  };
}

// 同步请求：返回 Forward 风格 { ok, status, data, headers }
function httpCall(method, url, body, options) {
  const opts = options || {};
  let target = String(url || "");
  const query = encodeQuery(opts.params);
  if (query) target += (target.indexOf("?") >= 0 ? "&" : "?") + query;

  const baseHeaders = Object.assign({}, DEFAULTS.headers || {}, opts.headers || {});
  if (!hasHeader(baseHeaders, "user-agent")) baseHeaders["User-Agent"] = UA;

  const payload = {
    headers: baseHeaders,
    method: String(opts.method || method || "get").toLowerCase(),
    timeout: parseInt(opts.timeout, 10) > 0 ? parseInt(opts.timeout, 10) : DEFAULTS.timeout,
  };
  if (opts.redirect !== undefined) payload.redirect = opts.redirect;

  let postData = body;
  if (postData === undefined || postData === null) postData = opts.data !== undefined ? opts.data : opts.body;
  if (postData !== undefined && postData !== null) {
    if (typeof postData === "string") {
      payload.body = postData;
      if (!hasHeader(baseHeaders, "content-type")) {
        payload.headers = Object.assign({}, baseHeaders, { "Content-Type": "application/json" });
      }
    } else {
      payload.data = postData;
      payload.postType = opts.postType || "json";
    }
  }
  try {
    return responseOf(runtimeReq(target, payload), target);
  } catch (e) {
    return { ok: false, status: 0, code: 0, data: "", headers: {}, url: target, error: String((e && e.message) || e) };
  }
}

/* =========================================================================
 * 3. Widget shim（Forward 模块沙箱 API）
 * ========================================================================= */

const DEFAULTS = { headers: {}, timeout: 20000 };

function makeStorage(namespace) {
  const memory = {};
  const ns = namespace || "fwd_rex";
  const read = (key, def) => {
    try {
      if (typeof local !== "undefined" && local && typeof local.get === "function") {
        const v = local.get(ns, String(key));
        if (v !== undefined && v !== null && v !== "") return v;
      }
    } catch (e) {}
    const v = memory[String(key)];
    return v === undefined ? (def === undefined ? "" : def) : v;
  };
  const write = (key, value) => {
    try {
      if (typeof local !== "undefined" && local && typeof local.set === "function") {
        local.set(ns, String(key), String(value));
        return;
      }
    } catch (e) {}
    memory[String(key)] = String(value);
  };
  const erase = (key) => {
    try {
      if (typeof local !== "undefined" && local && typeof local.delete === "function") local.delete(ns, String(key));
    } catch (e) {}
    delete memory[String(key)];
  };
  const storage = {
    get: (key, def) => read(key, def),
    set: (key, value) => write(key, value),
    remove: (key) => erase(key),
    clear: () => {
      const keys = Object.keys(memory);
      for (let i = 0; i < keys.length; i++) erase(keys[i]);
    },
  };
  storage.getAsync = async (key, def) => read(key, def);
  storage.setAsync = async (key, value) => write(key, value);
  storage.removeAsync = async (key) => erase(key);
  return storage;
}

function makeWidget(namespace) {
  return {
    http: {
      get: (url, options) => httpCall("get", url, undefined, options),
      head: (url, options) => httpCall("header", url, undefined, options),
      post: (url, body, options) => httpCall("post", url, body, options),
      put: (url, body, options) => httpCall("put", url, body, options),
      request: (options) => {
        const opts = options || {};
        const method = String(opts.method || "get").toLowerCase();
        let body;
        if (opts.data !== undefined) body = opts.data;
        else if (opts.body !== undefined) body = opts.body;
        return httpCall(method, opts.url, body, opts);
      },
    },
    html: { load: (html) => htmlLoad(html) },
    storage: makeStorage(namespace),
    tmdb: {
      get: (path, options) => {
        const opts = options || {};
        const base = opts.baseUrl || "https://api.themoviedb.org/3";
        const query = Object.assign({ language: "zh-CN" }, opts.params || {});
        if (opts.apiKey) query.api_key = opts.apiKey;
        return httpCall("get", base + path, undefined, Object.assign({}, opts, { params: query })).data;
      },
    },
    utils: {
      sleep: (ms) => new Promise((resolve) => safeSetTimeout(resolve, ms)),
    },
    log: function () {
      try {
        console.log.apply(console, arguments);
      } catch (e) {}
    },
  };
}

/* =========================================================================
 * 4. 加载 Forward 模块
 * ========================================================================= */

const BOOTSTRAP = [
  "var __fwd_meta = (typeof WidgetMetadata !== 'undefined' && WidgetMetadata) ? WidgetMetadata : null;",
  "var __fwd_fns = {};",
  "var __fwd_names = [];",
  "if (__fwd_meta && __fwd_meta.modules && __fwd_meta.modules.length) {",
  "  for (var __i = 0; __i < __fwd_meta.modules.length; __i++) {",
  "    var __n = __fwd_meta.modules[__i] && __fwd_meta.modules[__i].functionName;",
  "    if (__n && __fwd_names.indexOf(String(__n)) < 0) __fwd_names.push(String(__n));",
  "  }",
  "}",
  "if (__fwd_names.indexOf('loadDetail') < 0) __fwd_names.push('loadDetail');",
  "if (__fwd_names.indexOf('search') < 0) __fwd_names.push('search');",
  "for (var __j = 0; __j < __fwd_names.length; __j++) {",
  "  try {",
  "    var __v = eval(__fwd_names[__j]);",
  "    if (typeof __v === 'function') __fwd_fns[__fwd_names[__j]] = __v;",
  "  } catch (__e) {}",
  "}",
  "return { meta: __fwd_meta, fns: __fwd_fns };",
].join("\n");

// 同步 setTimeout：绝不能让原生定时器把回调丢回当前执行器（会自锁）
function safeSetTimeout(fn, ms) {
  const delay = Math.min(Math.max(parseInt(ms, 10) || 0, 0), 300);
  const until = Date.now() + delay;
  while (Date.now() < until) {
    /* 有界忙等：只用来让 Promise.race 之类的超时分支延后一点点 */
  }
  Promise.resolve().then(() => {
    try {
      fn();
    } catch (e) {}
  });
  return 0;
}

const atobImpl = (s) =>
  b64urlDecode(
    String(s == null ? "" : s)
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
  );
const btoaImpl = (s) => b64Standard(String(s == null ? "" : s));

function URLLike(input, base) {
  const abs = String(input || "");
  const m = /^([a-zA-Z][\w+.-]*):\/\/([^\/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/.exec(abs);
  if (!m) throw new Error("Invalid URL: " + abs);
  this.protocol = m[1] + ":";
  this.host = m[2];
  this.hostname = String(m[2]).split(":")[0];
  this.port = String(m[2]).indexOf(":") >= 0 ? String(m[2]).split(":")[1] : "";
  this.pathname = m[3] || "/";
  this.search = m[4] || "";
  this.hash = m[5] || "";
  this.origin = this.protocol + "//" + this.host;
  this.href = abs;
}
URLLike.prototype.toString = function () {
  return this.href;
};

// 把安全版定时器 / atob / btoa / URL / 全局别名装到上下文全局上：
// widget 里既有裸调用，也有 globalThis.setTimeout 这类写法，只加参数不够。
function installGlobals() {
  try {
    if (typeof globalThis === "undefined") return;
    globalThis.setTimeout = safeSetTimeout;
    globalThis.clearTimeout = function () {};
    if (typeof globalThis.atob !== "function") globalThis.atob = atobImpl;
    if (typeof globalThis.btoa !== "function") globalThis.btoa = btoaImpl;
    if (typeof globalThis.URL !== "function") globalThis.URL = URLLike;
    const aliases = ["global", "window", "self"];
    for (let i = 0; i < aliases.length; i++) {
      const name = aliases[i];
      if (globalThis[name]) continue;
      try {
        Object.defineProperty(globalThis, name, {
          enumerable: true,
          configurable: true,
          get() {
            return globalThis;
          },
          set() {},
        });
      } catch (e) {}
    }
  } catch (e) {}
}

// 部分 widget（瓜子影视等）会在运行时从 CDN 拉 CryptoJS / JSEncrypt 再间接 eval；
// 这里提前把它们装到全局，省一次失败并给离线环境兜底。
const CDN_LIBS = [
  { test: /CryptoJS|Crypto\b/, url: "https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js", global: "CryptoJS" },
  { test: /JSEncrypt/, url: "https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js", global: "JSEncrypt" },
];

function liteEval(code) {
  try {
    (0, eval)(code);
  } catch (e) {
    console.error("[fwd_rex] eval 失败：" + ((e && e.message) || e));
  }
}

function ensureLibsFor(source) {
  const text = String(source || "");
  for (let i = 0; i < CDN_LIBS.length; i++) {
    const lib = CDN_LIBS[i];
    if (!lib.test.test(text)) continue;
    try {
      if (typeof globalThis !== "undefined" && globalThis[lib.global]) continue;
    } catch (e) {}
    try {
      const res = httpCall("get", lib.url, undefined, { timeout: 15000, headers: { "User-Agent": UA } });
      if (res.ok && typeof res.data === "string" && res.data.length > 500) liteEval(res.data);
      else console.error("[fwd_rex] " + lib.global + " 下载失败 code=" + res.status);
    } catch (e) {
      console.error("[fwd_rex] " + lib.global + " 加载异常：" + ((e && e.message) || e));
    }
  }
}

function compileModule(source, shim, namespace) {
  const factory = new Function(
    "Widget",
    "console",
    "atob",
    "btoa",
    "URL",
    "setTimeout",
    "clearTimeout",
    "global",
    String(source) + "\n" + BOOTSTRAP
  );
  const consoleObj = typeof console !== "undefined" ? console : { log: () => {}, warn: () => {}, error: () => {} };
  const result = factory(shim, consoleObj, atobImpl, btoaImpl, URLLike, safeSetTimeout, () => {}, shim);
  return {
    meta: result && result.meta ? result.meta : null,
    fns: (result && result.fns) || {},
  };
}

/* =========================================================================
 * 5. 站点状态
 * ========================================================================= */

const state = {
  ext: {},
  mode: "sub",
  widgets: [],
  index: {},
  sourceCache: {},
  timeout: 20000,
};

function parseExt(extend) {
  if (!extend) return {};
  if (typeof extend === "string") {
    try {
      return JSON.parse(extend);
    } catch (e) {
      return {};
    }
  }
  if (typeof extend === "object") {
    try {
      return JSON.parse(JSON.stringify(extend));
    } catch (e) {
      return extend;
    }
  }
  return {};
}

function widgetNamespace(url) {
  let hash = 0;
  const s = String(url || "");
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return "fwd_" + Math.abs(hash).toString(36);
}

function httpGetText(url, options) {
  const res = httpCall("get", url, undefined, Object.assign({ timeout: state.timeout }, options || {}));
  if (!res.ok && !res.data) throw new Error("HTTP " + res.status + " " + url);
  return typeof res.data === "string" ? res.data : JSON.stringify(res.data);
}

function httpGetJson(url, options) {
  const res = httpCall("get", url, undefined, Object.assign({ timeout: state.timeout }, options || {}));
  if (res.data && typeof res.data === "object") return res.data;
  return safeJson(String(res.data || ""));
}

function registerWidget(entry) {
  const url = String(entry.url || "");
  if (!url) return null;
  if (state.index[url]) return state.index[url];
  const widget = {
    id: entry.id || url,
    title: entry.title || entry.id || "模块",
    description: entry.description || "",
    icon: entry.icon || "",
    url: url,
    namespace: widgetNamespace(url),
    loaded: false,
    error: "",
    meta: null,
    fns: {},
  };
  state.index[url] = widget;
  state.widgets.push(widget);
  return widget;
}

function ensureLoaded(widget) {
  if (!widget || widget.loaded) return widget;
  widget.loaded = true;
  try {
    let source = state.sourceCache[widget.url];
    if (!source) {
      source = httpGetText(widget.url, { redirect: 1 });
      state.sourceCache[widget.url] = source;
    }
    ensureLibsFor(source);
    const shim = makeWidget(widget.namespace);
    const compiled = compileModule(source, shim, widget.namespace);
    widget.meta = compiled.meta;
    widget.fns = compiled.fns;
    if (!widget.meta || !Array.isArray(widget.meta.modules) || !widget.meta.modules.length) {
      widget.error = "未找到 WidgetMetadata.modules";
    } else if (widget.meta.title && (!widget.title || /^模块\d*$/.test(String(widget.title)))) {
      widget.title = String(widget.meta.title);
    }
  } catch (e) {
    widget.error = String((e && e.message) || e);
    console.error("[fwd_rex] 加载 " + widget.url + " 失败：" + widget.error);
  }
  return widget;
}

function modulesOf(widget) {
  ensureLoaded(widget);
  const meta = widget.meta || {};
  const list = Array.isArray(meta.modules) ? meta.modules : [];
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (!m || !m.functionName) continue;
    if (typeof widget.fns[m.functionName] !== "function") continue;
    // type: "stream" 是「播放资源解析器」，不是可浏览栏目
    if (String(m.type || "").toLowerCase() === "stream") continue;
    out.push(m);
  }
  return out;
}

// 播放解析器：这几款模块统一用 type:"stream" + loadResource({link}) 出线路
function streamResolverOf(widget) {
  ensureLoaded(widget);
  const meta = widget.meta || {};
  const list = Array.isArray(meta.modules) ? meta.modules : [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (!m || !m.functionName) continue;
    if (String(m.type || "").toLowerCase() !== "stream") continue;
    if (typeof widget.fns[m.functionName] === "function") return m;
  }
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (m && typeof widget.fns[m.functionName] === "function" && /loadresource|playresolve|loadplay/i.test(String(m.functionName))) return m;
  }
  return null;
}

function normalizeStreams(out) {
  const streams = [];
  const list = Array.isArray(out) ? out : out ? [out] : [];
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (!node || typeof node !== "object") continue;
    const url = String(firstOf(node.videoUrl, node.video_url, node.url, node.path, ""));
    if (!url) continue;
    streams.push({
      name: String(firstOf(node.title, node.name, node.label, "线路" + (streams.length + 1))),
      url: url,
      headers: itemHeaders(node),
    });
  }
  return streams;
}

function moduleTitle(module, idx) {
  return String(firstOf(module && module.title, module && module.name, module && module.functionName, "栏目" + (idx + 1)));
}

/* ---- 参数 / 筛选 ---- */

function enumValuesOf(param) {
  const raw = param.enumOptions || param.enumValues || param.values || param.options || param.enums || [];
  const out = [];
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (item === null || item === undefined) continue;
    if (typeof item === "object") {
      const v = firstOf(item.value, item.v, item.key, item.id);
      const n = firstOf(item.title, item.name, item.label, item.n, v);
      out.push({ n: String(n), v: String(v) });
    } else out.push({ n: String(item), v: String(item) });
  }
  return out;
}

function filterOfModule(module) {
  const filters = [];
  const params = (module && module.params) || [];
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    if (!p || !p.name) continue;
    const type = String(p.type || "").toLowerCase();
    if (type === "enumeration" || type === "enum" || type === "select") {
      const values = enumValuesOf(p);
      if (!values.length) continue;
      const init = String(firstOf(p.value, p.defaultValue, values[0].v));
      filters.push({ key: String(p.name), name: String(firstOf(p.title, p.label, p.name)), init: init, value: values });
    }
  }
  return filters;
}

function buildParams(widget, module, pg, extend) {
  const params = {};
  const meta = (widget && widget.meta) || {};
  // 1) globalParams（所有模块共用）
  const globalParams = Array.isArray(meta.globalParams) ? meta.globalParams : [];
  for (let i = 0; i < globalParams.length; i++) {
    const p = globalParams[i];
    if (!p || !p.name) continue;
    if (p.value !== undefined) params[String(p.name)] = p.value;
    else if (p.defaultValue !== undefined) params[String(p.name)] = p.defaultValue;
  }
  // 2) 模块自身参数默认值（同名覆盖全局）
  const declared = (module && module.params) || [];
  for (let i = 0; i < declared.length; i++) {
    const p = declared[i];
    if (!p || !p.name) continue;
    const type = String(p.type || "").toLowerCase();
    if (type === "page") continue;
    if (p.value !== undefined) params[String(p.name)] = p.value;
    else if (p.defaultValue !== undefined) params[String(p.name)] = p.defaultValue;
  }
  // 3) 运行时传入（筛选、页码等）
  if (extend && typeof extend === "object") {
    const keys = Object.keys(extend);
    for (let i = 0; i < keys.length; i++) {
      const v = extend[keys[i]];
      if (v === undefined || v === null || v === "") continue;
      params[keys[i]] = v;
    }
  }
  // 4) ext.extra 强制覆盖
  const extra = state.ext.extra && typeof state.ext.extra === "object" ? state.ext.extra : {};
  const extraKeys = Object.keys(extra);
  for (let i = 0; i < extraKeys.length; i++) params[extraKeys[i]] = extra[extraKeys[i]];
  const page = parseInt(pg, 10);
  params.page = page > 0 ? page : 1;
  return params;
}

/* ---- MediaItem → Vod ---- */

function itemTitle(item) {
  return String(firstOf(item && item.title, item && item.name, item && item.id, ""));
}

function itemPic(item) {
  return String(
    firstOf(
      item && item.coverUrl,
      item && item.posterUrl,
      item && item.poster_url,
      item && item.posterPath,
      item && item.poster,
      item && item.cover,
      item && item.backdropUrl,
      item && item.backdropPath,
      item && item.thumbnail,
      ""
    )
  );
}

function itemDescription(item) {
  return String(firstOf(item && item.description, item && item.desc, item && item.overview, ""));
}

function itemRemarks(item) {
  const bits = [];
  const note = firstOf(item && item.remarks, item && item.vod_remarks, "");
  if (note) bits.push(String(note));
  if (item && item.year) bits.push(String(item.year));
  if (item && item.rating) bits.push("★" + item.rating);
  const mt = String(firstOf(item && item.mediaType, item && item.media_type, ""));
  if (mt === "tv" || mt === "series" || mt === "show") bits.push("剧集");
  return bits.join(" · ");
}

function slimItem(item) {
  const headers = (item && (item.customHeaders || item.headers)) || null;
  return {
    id: item && item.id !== undefined ? String(item.id) : "",
    title: itemTitle(item),
    link: item && item.link ? String(item.link) : "",
    videoUrl: item && (item.videoUrl || item.video_url) ? String(item.videoUrl || item.video_url) : "",
    pic: itemPic(item),
    content: itemDescription(item).slice(0, 300),
    headers: headers && typeof headers === "object" ? headers : null,
  };
}

function encodeItem(widget, item) {
  return "f1" + b64urlEncode(JSON.stringify({ w: widget.url, i: slimItem(item) }));
}

function encodePlay(source, widgetUrl) {
  return (
    "f2" +
    b64urlEncode(
      JSON.stringify({
        u: String((source && (source.url || source.videoUrl)) || ""),
        l: String((source && source.link) || ""),
        i: String((source && source.id) || ""),
        t: String((source && source.name) || ""),
        w: String(widgetUrl || ""),
        h: (source && source.headers) || null,
      })
    )
  );
}

function decodeToken(id) {
  const text = String(id || "");
  if (text.indexOf("f1") === 0) {
    try {
      return { kind: "item", data: JSON.parse(b64urlDecode(text.slice(2))) };
    } catch (e) {
      return { kind: "bad", data: {} };
    }
  }
  if (text.indexOf("f2") === 0) {
    try {
      return { kind: "play", data: JSON.parse(b64urlDecode(text.slice(2))) };
    } catch (e) {
      return { kind: "bad", data: {} };
    }
  }
  return { kind: "raw", data: { u: text } };
}

function toVod(widget, item) {
  const vod = {
    vod_id: encodeItem(widget, item),
    vod_name: itemTitle(item) || "未命名",
    vod_pic: itemPic(item),
    vod_remarks: itemRemarks(item),
    vod_content: itemDescription(item),
  };
  const pic = String(vod.vod_pic || "");
  if (pic && pic.indexOf("http") !== 0) vod.vod_pic = "";
  return vod;
}

function mapItems(widget, list) {
  const out = [];
  const arr = Array.isArray(list) ? list : list && Array.isArray(list.list) ? list.list : [];
  const seen = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item || typeof item !== "object") continue;
    if (String(item.type || "").toLowerCase() === "people") continue;
    if (String(item.type || "").toLowerCase() === "status") continue;
    const title = itemTitle(item);
    const pic = itemPic(item);
    if (!title && !pic) continue;
    const id = String(firstOf(item.id, item.link, item.videoUrl, title));
    if (seen[id]) continue;
    seen[id] = 1;
    out.push(toVod(widget, item));
  }
  return out;
}

/* ---- 详情 → 播放分组 ---- */

function itemHeaders(node, fallback) {
  const h = (node && (node.customHeaders || node.headers)) || fallback || null;
  return h && typeof h === "object" ? h : null;
}

function arrayOf() {
  for (let i = 0; i < arguments.length; i++) {
    if (Array.isArray(arguments[i]) && arguments[i].length) return arguments[i];
  }
  return [];
}

function toEpisode(ep, index, fallbackHeaders) {
  if (!ep || typeof ep !== "object") return null;
  const url = String(firstOf(ep.videoUrl, ep.video_url, ep.url, ""));
  const link = String(firstOf(ep.link, ""));
  const id = String(firstOf(ep.id, ep.link, ""));
  if (!url && !link && !id) return null;
  return {
    name: String(firstOf(ep.title, ep.name, ep.episodeName, "第" + (index + 1) + "集")),
    url: url,
    link: link && link !== url ? link : "",
    id: id && id !== link && id !== url ? id : "",
    headers: itemHeaders(ep, fallbackHeaders),
  };
}

// 从 detail 节点里抽出「线路 → 集」结构
function linesOfNode(node, fallbackTitle) {
  const lines = [];
  const push = (name, eps) => {
    const clean = [];
    for (let i = 0; i < eps.length; i++) if (eps[i]) clean.push(eps[i]);
    if (clean.length) lines.push({ name: String(firstOf(name, "线路" + (lines.length + 1))), eps: clean });
  };

  // 1) 显式季结构
  const seasons = arrayOf(node.seasons, node.seasonItems);
  if (seasons.length) {
    for (let s = 0; s < seasons.length; s++) {
      const season = seasons[s] || {};
      const seasonEps = arrayOf(season.episodes, season.episodeItems, season.items);
      const eps = [];
      for (let e = 0; e < seasonEps.length; e++) {
        const ep = toEpisode(seasonEps[e], e, itemHeaders(season));
        if (ep) eps.push(ep);
      }
      push(firstOf(season.title, season.name, "第" + (s + 1) + "季"), eps);
    }
    if (lines.length) return lines;
  }

  // 2) 扁平集数（带 seasonName/seasonNumber 时按线路分组，例如爱看机器人）
  const flat = arrayOf(node.episodeItems, node.childItems, node.episodes, node.items);
  if (flat.length) {
    const groups = {};
    const order = [];
    let multi = false;
    for (let e = 0; e < flat.length; e++) {
      const ep = flat[e];
      if (!ep || typeof ep !== "object") continue;
      const seasonKey = firstOf(ep.seasonName, ep.seasonNumber, ep.season, "");
      const key = seasonKey === "" ? "_" : String(seasonKey);
      if (key !== "_") multi = true;
      if (!groups[key]) {
        groups[key] = { name: String(firstOf(ep.seasonName, ep.seasonNumber ? "线路" + ep.seasonNumber : "", "")), eps: [] };
        order.push(key);
      }
      const item = toEpisode(ep, e, itemHeaders(node));
      if (item) groups[key].eps.push(item);
    }
    for (let i = 0; i < order.length; i++) {
      const g = groups[order[i]];
      if (multi && !g.name) g.name = "线路" + (i + 1);
      push(multi ? g.name : firstOf(node.title, node.name, fallbackTitle, "正片"), g.eps);
    }
    if (lines.length) return lines;
  }

  // 3) 同一影片多线路
  const sources = arrayOf(node.playSources, node.play_sources);
  if (sources.length) {
    for (let s = 0; s < sources.length; s++) {
      const src = sources[s] || {};
      const ep = toEpisode(src, 0, itemHeaders(node));
      if (ep) {
        ep.name = String(firstOf(node.title, node.name, ep.name, "播放"));
        push(firstOf(src.title, src.name, src.label, "线路" + (s + 1)), [ep]);
      }
    }
    if (lines.length) return lines;
  }

  // 4) 单个直链
  if (node.videoUrl || node.video_url) {
    const ep = toEpisode(node, 0, null);
    if (ep) {
      ep.name = String(firstOf(node.title, node.name, fallbackTitle, "播放"));
      push(firstOf(node.title, node.name, fallbackTitle), [ep]);
    }
  }
  return lines;
}

function buildPlayGroups(detail, fallbackTitle) {
  const groups = [];
  const nodes = Array.isArray(detail) ? detail : [detail];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node || typeof node !== "object") continue;
    // 状态提示条目（MissAV 的 buildStatusItem）不产生线路
    if (String(node.type || "") === "status" || String(node.id || "").indexOf("status:") === 0) continue;
    const lines = linesOfNode(node, fallbackTitle);
    for (let j = 0; j < lines.length; j++) groups.push(lines[j]);
  }
  return groups;
}

function groupsToVod(base, groups, widget) {
  const from = [];
  const urls = [];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const name = String(firstOf(g.name, "线路" + (i + 1))).split("$").join(" ").split("#").join(" ");
    from.push(name);
    const eps = [];
    for (let e = 0; e < g.eps.length; e++) {
      const ep = g.eps[e];
      const epName = String(firstOf(ep.name, "第" + (e + 1) + "集")).split("$").join(" ").split("#").join(" ");
      eps.push(epName + "$" + encodePlay(ep, widget ? widget.url : ""));
    }
    urls.push(eps.join("#"));
  }
  base.vod_play_from = from.join("$$$");
  base.vod_play_url = urls.join("$$$");
  return base;
}

/* =========================================================================
 * 6. 模块调用（async；widget 内部全是 async 函数）
 * ========================================================================= */

async function callModule(widget, module, params) {
  const fn = widget.fns[module.functionName];
  if (typeof fn !== "function") throw new Error("模块函数不存在：" + module.functionName);
  const result = await fn(params);
  if (result === null || result === undefined) return [];
  if (Array.isArray(result)) return result;
  if (typeof result === "object") {
    if (Array.isArray(result.list)) return result.list;
    if (Array.isArray(result.items)) return result.items;
    if (result.videoUrl || result.playSources || result.episodes || result.episodeItems || result.seasons) return result;
    return [];
  }
  return [];
}

function pickModule(modules, index) {
  const idx = parseInt(index, 10);
  if (idx >= 0 && idx < modules.length) return modules[idx];
  return modules[0];
}

/* =========================================================================
 * 7. WebHTV 契约
 * ========================================================================= */

function searchModuleOf(widget) {
  ensureLoaded(widget);
  const meta = widget.meta || {};
  const candidates = [];
  const declared = meta.search;
  if (Array.isArray(declared)) {
    for (let i = 0; i < declared.length; i++) if (declared[i] && declared[i].functionName) candidates.push(declared[i]);
  } else if (declared && typeof declared === "object" && declared.functionName) candidates.push(declared);

  const modules = modulesOf(widget);
  for (let i = 0; i < modules.length; i++) {
    const fn = String(modules[i].functionName || "").toLowerCase();
    const title = moduleTitle(modules[i], i).toLowerCase();
    if (fn === "search" || fn.indexOf("search") >= 0 || /搜索|搜尋/.test(title)) candidates.push(modules[i]);
  }
  for (let i = 0; i < candidates.length; i++) {
    if (typeof widget.fns[candidates[i].functionName] === "function") return candidates[i];
  }
  return null;
}

const spider = {
  init(extend) {
    state.ext = parseExt(extend);
    state.mode = "sub";
    state.widgets = [];
    state.index = {};
    state.sourceCache = {};
    state.timeout = parseInt(state.ext.timeout, 10) > 0 ? parseInt(state.ext.timeout, 10) : 20000;
    DEFAULTS.timeout = state.timeout;
    DEFAULTS.headers = state.ext.headers && typeof state.ext.headers === "object" ? state.ext.headers : {};

    if (state.ext.widgets && Array.isArray(state.ext.widgets) && state.ext.widgets.length) {
      state.mode = "widget";
      for (let i = 0; i < state.ext.widgets.length; i++) registerWidget({ url: String(state.ext.widgets[i]), title: "模块" + (i + 1) });
    } else if (state.ext.url) {
      state.mode = "widget";
      registerWidget({ url: String(state.ext.url), title: state.ext.name ? String(state.ext.name) : "" });
    } else {
      state.mode = "sub";
      const sub = String(state.ext.sub || DEFAULT_SUB);
      try {
        const manifest = httpGetJson(sub);
        const list = (manifest && manifest.widgets) || [];
        for (let i = 0; i < list.length; i++) {
          const w = list[i] || {};
          if (!w.url) continue;
          registerWidget({
            id: w.id || w.url,
            title: w.title || w.name || w.id || "模块",
            description: w.description || "",
            icon: w.icon || w.logo || "",
            url: String(w.url),
          });
        }
        if (manifest && manifest.title && state.ext.name) state.ext.name = String(state.ext.name);
      } catch (e) {
        console.error("[fwd_rex] 订阅加载失败：" + ((e && e.message) || e));
      }
    }
    if (state.ext.name && state.widgets.length === 1) state.widgets[0].title = String(state.ext.name);
    installGlobals();
    return "";
  },

  async home() {
    const classes = [];
    const filters = {};
    try {
      // init 时订阅拉取失败（网络抖动）时，进首页再补一次
      if (!state.widgets.length && state.mode === "sub") spider.init(state.ext);
      if (state.mode === "widget") {
        for (let w = 0; w < state.widgets.length; w++) {
          const widget = ensureLoaded(state.widgets[w]);
          const modules = modulesOf(widget);
          const prefix = state.widgets.length > 1 ? widget.title + "·" : "";
          for (let i = 0; i < modules.length; i++) {
            const tid = state.widgets.length > 1 ? "m" + w + "_" + i : String(i);
            classes.push({
              type_id: tid,
              type_name: prefix + moduleTitle(modules[i], i),
              type_flag: 0,
            });
            const f = filterOfModule(modules[i]);
            if (f.length) filters[tid] = f;
          }
          if (!modules.length) {
            classes.push({ type_id: "m" + w + "_0", type_name: widget.title + (widget.error ? "（加载失败）" : "（无栏目）") });
          }
        }
      } else {
        for (let i = 0; i < state.widgets.length; i++) {
          const widget = state.widgets[i];
          classes.push({ type_id: "w" + i, type_name: String(widget.title || widget.id), type_flag: 0 });
        }
      }
    } catch (e) {
      console.error("[fwd_rex] home 失败：" + ((e && e.message) || e));
    }
    return JSON.stringify({ class: classes, filters: filters });
  },

  async homeVod() {
    if (state.mode !== "widget") return JSON.stringify({ list: [] });
    try {
      const widget = ensureLoaded(state.widgets[0]);
      const modules = modulesOf(widget);
      if (!modules.length) return JSON.stringify({ list: [] });
      let module = modules[0];
      for (let i = 0; i < modules.length; i++) {
        const t = moduleTitle(modules[i], i).toLowerCase();
        if (/首页|推荐|最新|热门|更新|home|recent|popular/.test(t)) {
          module = modules[i];
          break;
        }
      }
      const items = await callModule(widget, module, buildParams(widget, module, 1, null));
      const list = mapItems(widget, items).slice(0, 30);
      return JSON.stringify({ list: list });
    } catch (e) {
      console.error("[fwd_rex] homeVod 失败：" + ((e && e.message) || e));
      return JSON.stringify({ list: [] });
    }
  },

  async category(tid, pg, filter, extend) {
    const page = parseInt(pg, 10) > 0 ? parseInt(pg, 10) : 1;
    const filters = {};
    try {
      let widget = null;
      let module = null;
      let extra = extend && typeof extend === "object" ? Object.assign({}, extend) : {};

      if (state.mode === "widget") {
        if (state.widgets.length > 1) {
          const parts = String(tid).replace(/^m/, "").split("_");
          widget = state.widgets[parseInt(parts[0], 10) || 0] || state.widgets[0];
          module = pickModule(modulesOf(ensureLoaded(widget)), parts[1]);
        } else {
          widget = ensureLoaded(state.widgets[0]);
          module = pickModule(modulesOf(widget), tid);
        }
        if (widget && module) {
          const f = filterOfModule(module);
          if (f.length) filters[String(tid)] = f;
        }
      } else {
        const idx = parseInt(String(tid).replace(/^w/, ""), 10);
        widget = ensureLoaded(state.widgets[idx >= 0 && idx < state.widgets.length ? idx : 0]);
        const modules = modulesOf(widget);
        const mIdx = parseInt(extra.m, 10) >= 0 && extra.m !== undefined ? parseInt(extra.m, 10) : 0;
        delete extra.m;
        module = modules[mIdx] || modules[0];
        const f = [];
        if (modules.length > 1) {
          const column = [];
          for (let i = 0; i < modules.length; i++) column.push({ n: moduleTitle(modules[i], i), v: String(i) });
          f.push({ key: "m", name: "栏目", init: String(mIdx), value: column });
        }
        const merged = filterOfModule(module);
        for (let i = 0; i < merged.length; i++) f.push(merged[i]);
        if (f.length) filters[String(tid)] = f;
      }

      if (!widget || !module) {
        return JSON.stringify({ list: [], pagecount: page, filters: filters, msg: widget && widget.error ? widget.error : "无可播栏目" });
      }
      const params = buildParams(widget, module, page, extra);
      const items = await callModule(widget, module, params);
      const list = mapItems(widget, items);
      if (state.widgets.length > 1) {
        for (let i = 0; i < list.length; i++) {
          const remark = widget.title + (list[i].vod_remarks ? " · " + list[i].vod_remarks : "");
          list[i].vod_remarks = remark;
        }
      }
      return JSON.stringify({ list: list, pagecount: list.length ? page + 1 : page, filters: filters });
    } catch (e) {
      console.error("[fwd_rex] category 失败：" + ((e && e.message) || e));
      return JSON.stringify({ list: [], pagecount: page, filters: filters, msg: String((e && e.message) || e) });
    }
  },

  async detail(id) {
    try {
      const token = decodeToken(id);
      if (token.kind !== "item") return JSON.stringify({ list: [] });
      const item = token.data.i || {};
      const widget = state.index[token.data.w] || state.widgets[0];
      if (widget) ensureLoaded(widget);

      const base = {
        vod_id: String(id),
        vod_name: String(firstOf(item.title, "未命名")),
        vod_pic: String(firstOf(item.pic, "")),
        vod_content: String(firstOf(item.content, "")),
      };

      let detail = null;
      const direct = String(firstOf(item.videoUrl, ""));
      if (direct) {
        detail = { videoUrl: direct, title: base.vod_name, customHeaders: item.headers };
      } else if (widget && typeof widget.fns.loadDetail === "function" && item.link) {
        detail = await widget.fns.loadDetail(item.link);
      } else if (item.link && /\.(m3u8|mp4|flv|mkv|ts)(\?|$)/i.test(item.link)) {
        detail = { videoUrl: item.link, title: base.vod_name, customHeaders: item.headers };
      }

      if (!detail) return JSON.stringify({ list: [], msg: "该站点未提供可解析的播放信息" });

      const groups = buildPlayGroups(detail, base.vod_name);
      if (!groups.length) return JSON.stringify({ list: [], msg: "未解析到播放地址（可能被站点拦截）" });
      return JSON.stringify({ list: [groupsToVod(base, groups, widget)] });
    } catch (e) {
      console.error("[fwd_rex] detail 失败：" + ((e && e.message) || e));
      return JSON.stringify({ list: [], msg: String((e && e.message) || e) });
    }
  },

  async search(key, quick, pg) {
    const page = parseInt(pg, 10) > 0 ? parseInt(pg, 10) : 1;
    const keyword = String(key || "");
    const list = [];
    try {
      const max = parseInt(state.ext.maxSearch, 10) > 0 ? parseInt(state.ext.maxSearch, 10) : 10;
      let targets = state.widgets;
      if (state.mode === "widget" && state.widgets.length === 1) targets = state.widgets;
      else targets = state.widgets.slice(0, max);

      for (let i = 0; i < targets.length; i++) {
        const widget = ensureLoaded(targets[i]);
        try {
          const module = searchModuleOf(widget);
          if (!module) continue;
          let keyName = "keyword";
          const declared = module.params || [];
          for (let p = 0; p < declared.length; p++) {
            if (String(declared[p].type || "").toLowerCase() === "input") keyName = String(declared[p].name);
          }
          const params = buildParams(widget, module, page, null);
          params[keyName] = keyword;
          const mapped = mapItems(widget, await callModule(widget, module, params));
          for (let m = 0; m < mapped.length; m++) {
            if (state.widgets.length > 1) {
              mapped[m].vod_remarks = widget.title + (mapped[m].vod_remarks ? " · " + mapped[m].vod_remarks : "");
            }
            list.push(mapped[m]);
          }
        } catch (e) {
          console.error("[fwd_rex] search 跳过 " + widget.title + "：" + ((e && e.message) || e));
        }
        if (list.length >= 80) break;
      }
      return JSON.stringify({ list: list, pagecount: list.length ? page + 1 : page });
    } catch (e) {
      console.error("[fwd_rex] search 失败：" + ((e && e.message) || e));
      return JSON.stringify({ list: [], pagecount: page });
    }
  },

  async play(flag, id, vipFlags) {
    try {
      const token = decodeToken(id);
      const data = token.data || {};
      const widget = state.index[data.w] || state.widgets[0];
      let streams = [];
      let headers = data.h && typeof data.h === "object" ? data.h : null;

      if (data.u) {
        streams = [{ name: "默认", url: String(data.u), headers: headers }];
      } else if (widget && (data.l || data.i)) {
        ensureLoaded(widget);
        const payload = {
          link: String(firstOf(data.l, data.i, "")),
          id: String(firstOf(data.i, data.l, "")),
          title: String(firstOf(data.t, "")),
          page: 1,
        };
        // 1) stream 解析器（loadResource）：link 的编码形态各站不同，两种都试一次
        const resolver = streamResolverOf(widget);
        if (resolver) {
          const linkVariants = [];
          if (data.l) linkVariants.push(String(data.l));
          if (data.i && String(data.i) !== String(data.l)) linkVariants.push(String(data.i));
          for (let v = 0; v < linkVariants.length && !streams.length; v++) {
            try {
              const payload2 = Object.assign({}, payload, { link: linkVariants[v], id: linkVariants[v] });
              const out = await callModule(widget, resolver, Object.assign(buildParams(widget, resolver, 1, null), payload2));
              streams = normalizeStreams(out);
            } catch (e) {
              console.error("[fwd_rex] 解析器失败：" + ((e && e.message) || e));
            }
          }
        }
        // 2) 兜底：再按 link 解一次详情
        if (!streams.length && typeof widget.fns.loadDetail === "function") {
          try {
            const detail = await widget.fns.loadDetail(payload.link);
            const groups = buildPlayGroups(detail, payload.title);
            for (let g = 0; g < groups.length; g++) {
              for (let e = 0; e < groups[g].eps.length; e++) {
                const ep = groups[g].eps[e];
                if (ep.url) streams.push({ name: groups[g].name, url: ep.url, headers: ep.headers });
              }
            }
          } catch (e) {
            console.error("[fwd_rex] 详情兜底失败：" + ((e && e.message) || e));
          }
        }
      }

      if (!streams.length) return JSON.stringify({ parse: 0, url: "" });

      // flag 命中线路名时优先
      let chosen = streams[0];
      const want = String(flag || "");
      for (let i = 0; i < streams.length; i++) {
        if (want && streams[i].name === want) {
          chosen = streams[i];
          break;
        }
      }
      if (streams.length > 1) {
        const pairs = [];
        for (let i = 0; i < streams.length; i++) pairs.push(streams[i].name, streams[i].url);
        const out = { parse: 0, url: pairs };
        if (chosen.headers) out.header = chosen.headers;
        return JSON.stringify(out);
      }
      const out = { parse: 0, url: chosen.url };
      if (chosen.headers) out.header = chosen.headers;
      if (/\.m3u8(\?|$)/i.test(chosen.url)) out.format = "application/x-mpegURL";
      return JSON.stringify(out);
    } catch (e) {
      console.error("[fwd_rex] play 失败：" + ((e && e.message) || e));
      return JSON.stringify({ parse: 0, url: "" });
    }
  },

  destroy() {
    state.widgets = [];
    state.index = {};
    state.sourceCache = {};
  },
};

export default spider;

/* 调试出口（WebHTV 只取 default，这里的命名导出不会影响运行） */
export const __debug = {
  load(url) {
    const widget = ensureLoaded(registerWidget({ url: String(url) }));
    return {
      title: widget.title,
      error: widget.error,
      meta: widget.meta,
      modules: modulesOf(widget).map((m, i) => ({
        i: i,
        id: m.id,
        title: moduleTitle(m, i),
        functionName: m.functionName,
        params: (m.params || []).map((p) => ({ name: p.name, type: p.type, value: p.value, options: enumValuesOf(p).length })),
      })),
      fns: Object.keys(widget.fns),
    };
  },
  async call(url, fnName, params) {
    const widget = ensureLoaded(registerWidget({ url: String(url) }));
    const fn = widget.fns[String(fnName)];
    if (typeof fn !== "function") throw new Error("no fn " + fnName);
    const out = await fn(params || {});
    return { type: Array.isArray(out) ? "array" : typeof out, raw: out };
  },
  htmlLoad: htmlLoad,
  state: state,
};
