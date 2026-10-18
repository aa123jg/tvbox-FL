/**
 * 蜜桃视频 ForwardWidget v1.4.0
 * 源站: honeypeach.cc · HMAC 签名 API
 * 模块: 视频/短剧/擦边/动漫/国产/黑料
 * t.me/nostremby
 */
WidgetMetadata = {
  id: "forward.mitao.tut",
  title: "蜜桃视频",
  version: "1.4.0",
  requiredVersion: "0.0.1",
  description: "蜜桃视频/短剧/直播/国产/黑料 · PoW+多线路 | t.me/nostremby",
  author: "宝宝巴士",
  logo: "https://fwd.uou.qzz.io/icon.png",
  site: "https://t.me/nostremby",
  detailCacheDuration: 180,
  modules: [
    /* —— 蜜桃视频（各大类单独成栏） —— */
    {
      id: "video_new",
      title: "最近更新",
      functionName: "loadVideoNew",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "video_release",
      title: "新作上市",
      functionName: "loadVideoRelease",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "video_chinese",
      title: "中文字幕",
      functionName: "loadVideoChinese",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "video_madou",
      title: "麻豆传媒",
      functionName: "loadVideoMadou",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "video_uncensored",
      title: "无码流出",
      functionName: "loadVideoUncensored",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "video_hot",
      title: "热门",
      functionName: "loadVideoHot",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    /* —— 短剧 / 擦边 / 动漫 / 黑料 —— */
    {
      id: "duanju",
      title: "蜜桃短剧",
      functionName: "loadDuanju",
      cacheDuration: 600,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "cat",
          title: "分类",
          type: "enumeration",
          value: "tuijian|huangguo|0",
          enumOptions: [
            { title: "推荐", value: "tuijian|huangguo|0" },
            { title: "AI成人短剧", value: "duanju|huangguo|0" },
            { title: "AI成人漫剧", value: "manju|huangguo|0" },
            { title: "AI换脸", value: "huanlian|huangguo|0" },
            { title: "AI魔改", value: "mogai|huangguo|0" },
            { title: "排行榜", value: "rank|huangguo|0" },
            { title: "黄豆精选", value: "all|huangdou|" },
            { title: "黄豆原创", value: "yuandou|huangdou|" }
          ]
        }
      ]
    },
    {
      id: "caibian",
      title: "擦边短剧",
      functionName: "loadCaibian",
      cacheDuration: 600,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "cat",
          title: "分类",
          type: "enumeration",
          value: "0|huangdou|0",
          enumOptions: [
            { title: "最新", value: "0|huangdou|0" },
            { title: "推荐", value: "1|huangdou|1" },
            { title: "全部", value: "2|huangdou|2" }
          ]
        }
      ]
    },
    {
      id: "shortv",
      title: "蜜桃动漫",
      functionName: "loadShortv",
      cacheDuration: 600,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "cat",
          title: "分类",
          type: "enumeration",
          value: "all|dongman|0",
          enumOptions: [
            { title: "全部", value: "all|dongman|0" },
            { title: "Hanime", value: "Hanime|dongman|0" },
            { title: "NaughtyMachinima", value: "NaughtyMachinima|dongman|0" },
            { title: "HS日本4K动漫", value: "HS日本4K动漫|dongman|0" }
          ]
        }
      ]
    },
    {
      id: "heiliao",
      title: "黑料吃瓜",
      functionName: "loadHeiliao",
      cacheDuration: 600,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "cat",
          title: "分类",
          type: "enumeration",
          value: "0|huangdou|0",
          enumOptions: [
            { title: "最新", value: "0|huangdou|0" },
            { title: "推荐", value: "1|huangdou|1" }
          ]
        }
      ]
    },
    {
      id: "live",
      title: "蜜桃直播",
      functionName: "loadLive",
      cacheDuration: 120,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "cat",
          title: "分类",
          type: "enumeration",
          value: "girls||",
          enumOptions: [
            { title: "女主播", value: "girls||" },
            { title: "情侣", value: "couples||" },
            { title: "男主播", value: "men||" },
            { title: "跨性别", value: "trans||" },
            { title: "中国", value: "cn||" },
            { title: "日本", value: "jp||" }
          ]
        }
      ]
    },
    {
      id: "guochan",
      title: "国产精品",
      functionName: "loadGuochan",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "loadResource",
      title: "播放资源",
      functionName: "loadResource",
      type: "stream",
      cacheDuration: 0,
      params: []
    }
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input" },
      { name: "page", title: "页码", type: "page" }
    ]
  }
};

var BASE = "https://honeypeach.cc";
var UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
var SEARCHABLE = ["video", "duanju", "caibian", "shortv", "guochan"];

var _sid = "";
var _skey = "";
var _exp = 0;
var _dev = "";

function t(v) {
  return String(v == null ? "" : v).trim();
}

function rnd(n) {
  n = n || 10;
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var s = "";
  for (var i = 0; i < n; i++) s += chars.charAt((Math.random() * chars.length) | 0);
  return s;
}

function absUrl(u) {
  u = t(u);
  if (!u) return "";
  if (u.indexOf("http") === 0) return u;
  if (u.charAt(0) === "/") return BASE + u;
  return BASE + "/" + u;
}

/* ---------- SHA-256 / HMAC（纯 JS，无依赖） ---------- */
function sha256Hex(msg) {
  var bytes = typeof msg === "string" ? strToBytes(msg) : msg;
  return bytesToHex(sha256Bytes(bytes));
}

function strToBytes(s) {
  var out = [];
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      var cp = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return out;
}

function bytesToHex(arr) {
  var h = "";
  for (var i = 0; i < arr.length; i++) h += ("0" + (arr[i] & 0xff).toString(16)).slice(-2);
  return h;
}

function hexToBytes(hex) {
  var out = [];
  hex = t(hex);
  for (var i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
  return out;
}

function sha256Bytes(msgBytes) {
  function rotr(n, x) {
    return (x >>> n) | (x << (32 - n));
  }
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var l = msgBytes.length;
  var withOne = msgBytes.slice();
  withOne.push(0x80);
  while ((withOne.length % 64) !== 56) withOne.push(0);
  var bitLen = l * 8;
  for (var i = 7; i >= 0; i--) withOne.push((bitLen / Math.pow(2, 8 * i)) & 0xff);

  for (var off = 0; off < withOne.length; off += 64) {
    var w = new Array(64);
    for (var j = 0; j < 16; j++) {
      var i0 = off + j * 4;
      w[j] =
        ((withOne[i0] << 24) | (withOne[i0 + 1] << 16) | (withOne[i0 + 2] << 8) | withOne[i0 + 3]) >>> 0;
    }
    for (var j = 16; j < 64; j++) {
      var s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
      var s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }
    var a = H[0],
      b = H[1],
      c = H[2],
      d = H[3],
      e = H[4],
      f = H[5],
      g = H[6],
      h = H[7];
    for (var j = 0; j < 64; j++) {
      var S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      var ch = (e & f) ^ (~e & g);
      var t1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      var S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  var out = [];
  for (var i = 0; i < 8; i++) {
    out.push((H[i] >>> 24) & 0xff, (H[i] >>> 16) & 0xff, (H[i] >>> 8) & 0xff, H[i] & 0xff);
  }
  return out;
}

function hmacSha256Hex(keyBytes, msgStr) {
  var block = 64;
  var key = keyBytes.slice();
  if (key.length > block) key = sha256Bytes(key);
  while (key.length < block) key.push(0);
  var oKey = [],
    iKey = [];
  for (var i = 0; i < block; i++) {
    oKey.push(key[i] ^ 0x5c);
    iKey.push(key[i] ^ 0x36);
  }
  var inner = sha256Bytes(iKey.concat(strToBytes(msgStr)));
  return bytesToHex(sha256Bytes(oKey.concat(inner)));
}

/* ---------- 会话 ---------- */
function devId() {
  if (!_dev) _dev = rnd(12) + Date.now().toString(16);
  return _dev;
}

/* ---- 站点 L3 人机挑战（与官网 hpsign.js 一致）---- */
function hpHash(s) {
  var h = 0x811c9dc5;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}
function hpPow(chal, nonce) {
  var h = hpHash(chal + ":" + nonce);
  for (var r = 0; r < 4; r++) {
    h = hpHash((("0000000" + h.toString(16)).slice(-8)) + chal);
  }
  return ("0000000" + h.toString(16)).slice(-8);
}
function hpSolve(chal, bits) {
  bits = parseInt(bits || 16, 10) || 16;
  var want = "";
  for (var i = 0; i < (bits >> 2); i++) want += "0";
  var n = 0, nx, hx;
  while (n < 20000000) {
    nx = n.toString(16);
    hx = hpPow(chal, nx);
    if (hx.slice(0, want.length) === want) return chal + "." + nx;
    n++;
  }
  return "";
}

function parseBody(res) {
  var body = res && (res.data != null ? res.data : res);
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  return body || {};
}

async function handshake() {
  var q = "dev=" + encodeURIComponent(devId());
  var res = await Widget.http.get(BASE + "/api/handshake?" + q, {
    headers: { "User-Agent": UA, Accept: "application/json" }
  });
  var body = parseBody(res);
  // 需要 PoW：算完带 c=chal.nonce 再握一次
  if (body && body.need_chal) {
    var tok = hpSolve(String(body.need_chal), body.bits || 12);
    if (!tok) throw new Error("蜜桃 PoW 失败");
    res = await Widget.http.get(
      BASE + "/api/handshake?" + q + "&c=" + encodeURIComponent(tok),
      { headers: { "User-Agent": UA, Accept: "application/json" } }
    );
    body = parseBody(res);
  }
  if (body && body.sid && body.skey) {
    _sid = String(body.sid);
    _skey = String(body.skey);
    _exp = Number(body.exp || 0);
    return true;
  }
  throw new Error("蜜桃握手失败: " + (body.msg || body.err || "no sid"));
}

function rotateDev() {
  _dev = "zp" + rnd(24);
  _sid = "";
  _skey = "";
  _exp = 0;
}

function isRateLimited(body, status) {
  if (status === 429) return true;
  var err = t((body && (body.err || body.msg)) || "").toLowerCase();
  if (!err) return false;
  return (
    err.indexOf("rl_sid") >= 0 ||
    err.indexOf("rl_dev") >= 0 ||
    err.indexOf("rl_ip") >= 0 ||
    err.indexOf("rate") >= 0 ||
    err.indexOf("limit") >= 0 ||
    err.indexOf("toomany") >= 0 ||
    err.indexOf("busy") >= 0
  );
}

async function ensureSession(force) {
  var now = Date.now() / 1000;
  if (!force && _sid && _skey && now < _exp - 60) return;
  await handshake();
}

async function apiGet(path, query) {
  query = t(query);
  await ensureSession(false);
  async function once() {
    var ts = String(Math.floor(Date.now() / 1000));
    var nonce = rnd(8) + Date.now().toString(16);
    var bh = sha256Hex("");
    var canon =
      "GET\n" + path + "\n" + query + "\n" + bh + "\n" + ts + "\n" + nonce + "\n" + _sid;
    var sig = hmacSha256Hex(hexToBytes(_skey), canon);
    var url = BASE + path + (query ? "?" + query : "");
    var res = await Widget.http.get(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "X-Hp-Sid": _sid,
        "X-Hp-Ts": ts,
        "X-Hp-Nonce": nonce,
        "X-Hp-Sign": sig,
        Referer: BASE + "/"
      }
    });
    var body = res && (res.data != null ? res.data : res);
    var status = res && res.status != null ? res.status : 200;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    return { status: status, data: body || {} };
  }
  var r = await once();
  // 401 / 签名过期 → 重握手
  if (r.status === 401) {
    await ensureSession(true);
    r = await once();
  }
  // 限流 → 换设备号重新握手再试一次
  if (isRateLimited(r.data, r.status)) {
    rotateDev();
    await ensureSession(true);
    r = await once();
  }
  return r.data;
}

/* ---------- 列表映射 ---------- */
function mapItem(it, key, src, sub) {
  if (!it || it.id == null) return null;
  var iid = String(it.id);
  var s = t(it.src || src || "");
  var title = t(it.title || iid);
  // 片名写进 link，详情不依赖内存、不串台（同花都）
  var link =
    "mt://" +
    encodeURIComponent(key) +
    "|" +
    encodeURIComponent(iid) +
    "|" +
    encodeURIComponent(s) +
    "|" +
    encodeURIComponent(t(sub || "")) +
    "||" +
    encodeURIComponent(title);
  return {
    id: link,
    type: "url",
    title: title,
    name: title,
    description: t(it.remark || ""),
    mediaType: "movie",
    link: link,
    coverUrl: absUrl(it.cover || ""),
    posterPath: absUrl(it.cover || ""),
    backdropPath: absUrl(it.cover || "")
  };
}

function parseLink(link) {
  var listTitle = "";
  if (link && typeof link === "object") {
    listTitle = t(link.title || link.name || "");
    link = link.link || link.id || "";
  }
  link = t(link).replace(/^mt:\/\//, "");
  // 嵌入片名: ...||title
  var emb = "";
  var di = link.indexOf("||");
  if (di >= 0) {
    emb = link.slice(di + 2);
    link = link.slice(0, di);
    try {
      emb = decodeURIComponent(emb);
    } catch (e) {}
  }
  var parts = link.split("|");
  return {
    key: safeDec(parts[0]),
    id: safeDec(parts[1]),
    src: safeDec(parts[2]),
    sub: safeDec(parts[3]),
    ep: safeDec(parts[4]) || "1",
    listTitle: listTitle || emb || ""
  };
}
function safeDec(v) {
  v = t(v);
  if (!v) return "";
  try {
    return decodeURIComponent(v);
  } catch (e) {
    return v;
  }
}

/** cat 参数格式: code|src|sub */
function parseCatParam(raw, fallback) {
  raw = t(raw || fallback || "");
  var parts = raw.split("|");
  return {
    cat: t(parts[0] || ""),
    src: t(parts[1] || ""),
    sub: t(parts[2] || "")
  };
}

async function loadModule(key, params, fallbackCat) {
  params = params || {};
  var page = parseInt(params.page, 10) || 1;
  var pc = parseCatParam(params.cat, fallbackCat);
  if (!pc.cat) pc = parseCatParam(fallbackCat, "new|missav|");
  var q =
    "key=" +
    encodeURIComponent(key) +
    "&cat=" +
    encodeURIComponent(pc.cat) +
    "&page=" +
    page;
  if (pc.src) q += "&src=" + encodeURIComponent(pc.src);
  if (pc.sub !== "") q += "&sub=" + encodeURIComponent(pc.sub);
  var data = await apiGet("/api/module", q);
  var list = [];
  var rows = (data && data.list) || [];
  for (var i = 0; i < rows.length; i++) {
    var v = mapItem(rows[i], key, pc.src, pc.sub);
    if (v) list.push(v);
  }
  return list;
}

/* 视频各大类：独立 module，固定 cat|src，无二级 enum */
async function loadVideoNew(params) {
  return loadModule("video", Object.assign({}, params, { cat: "new|missav|" }), "new|missav|");
}
async function loadVideoRelease(params) {
  return loadModule("video", Object.assign({}, params, { cat: "release|missav|" }), "release|missav|");
}
async function loadVideoChinese(params) {
  return loadModule("video", Object.assign({}, params, { cat: "chinese-subtitle|missav|" }), "chinese-subtitle|missav|");
}
async function loadVideoMadou(params) {
  return loadModule("video", Object.assign({}, params, { cat: "madou|missav|" }), "madou|missav|");
}
async function loadVideoUncensored(params) {
  return loadModule("video", Object.assign({}, params, { cat: "uncensored-leak|missav|" }), "uncensored-leak|missav|");
}
async function loadVideoHot(params) {
  return loadModule("video", Object.assign({}, params, { cat: "monthly-hot|missav|" }), "monthly-hot|missav|");
}
async function loadDuanju(params) {
  return loadModule("duanju", params, "tuijian|huangguo|0");
}
async function loadCaibian(params) {
  return loadModule("caibian", params, "0|huangdou|0");
}
async function loadShortv(params) {
  return loadModule("shortv", params, "all|dongman|0");
}
async function loadHeiliao(params) {
  return loadModule("heiliao", params, "0|huangdou|0");
}
async function loadLive(params) {
  return loadModule("live", params, "girls||");
}
async function loadGuochan(params) {
  return loadModule("guochan", params, "||");
}

async function search(params) {
  params = params || {};
  var kw = t(params.keyword || params.wd || params.q);
  if (!kw) return [];
  var page = parseInt(params.page, 10) || 1;
  var out = [];
  var seen = {};
  for (var i = 0; i < SEARCHABLE.length; i++) {
    var mod = SEARCHABLE[i];
    try {
      var data = await apiGet(
        "/api/search",
        "key=" + encodeURIComponent(mod) + "&kw=" + encodeURIComponent(kw) + "&page=" + page
      );
      var rows = (data && data.list) || [];
      for (var j = 0; j < rows.length; j++) {
        var v = mapItem(rows[j], mod, "", "");
        if (v && !seen[v.id]) {
          seen[v.id] = 1;
          out.push(v);
        }
      }
    } catch (e) {}
  }
  return out;
}

async function loadDetail(link) {
  var p = parseLink(link);
  if (!p.key || !p.id) throw new Error("缺少 id");
  // 列表带进的片名最优先（花都同款，防详情串台）
  var listTitle = t(p.listTitle || "");
  if (!listTitle && link && typeof link === "object") {
    listTitle = t(link.title || link.name || "");
  }

  var params = [];
  if (p.src) params.push("src=" + encodeURIComponent(p.src));
  if (p.sub) params.push("sub=" + encodeURIComponent(p.sub));
  var q = params.join("&");
  var data = await apiGet(
    "/api/detail/" + encodeURIComponent(p.key) + "/" + encodeURIComponent(p.id),
    q
  );
  var det = (data && data.detail) || null;
  if (!det) throw new Error("详情为空");

  var apiTitle = t(det.title || "");
  // 始终优先列表标题
  var title = listTitle || apiTitle || p.id;
  var cover = absUrl(det.cover || "");
  var desc = t(det.desc || "");
  var remarks = det.ep_count ? "共" + det.ep_count + "集" : t(det.date || "");
  var eps = det.episodes || [];
  if (!eps.length) eps = [{ ep: 1, name: "正片" }];

  var baseLink =
    "mt://" +
    encodeURIComponent(p.key) +
    "|" +
    encodeURIComponent(p.id) +
    "|" +
    encodeURIComponent(p.src) +
    "|" +
    encodeURIComponent(p.sub) +
    "||" +
    encodeURIComponent(title);

  var childItems = [];
  for (var i = 0; i < eps.length; i++) {
    var e = eps[i] || {};
    var ep = String(e.ep != null ? e.ep : i + 1);
    var epName = t(e.name || "").replace(/[$#]/g, " ");
    // 单集用正片名；多集：正片名 + 第N集（App 常用第一集 title 当详情标题）
    if (eps.length === 1) {
      epName = title;
    } else {
      if (!epName || epName === "正片" || epName === "播放") {
        epName = title + " 第" + ep + "集";
      } else if (epName.indexOf(title) !== 0) {
        epName = title + " " + epName;
      }
    }
    var elink =
      "mt://" +
      encodeURIComponent(p.key) +
      "|" +
      encodeURIComponent(p.id) +
      "|" +
      encodeURIComponent(p.src) +
      "|" +
      encodeURIComponent(p.sub) +
      "|" +
      encodeURIComponent(ep) +
      "||" +
      encodeURIComponent(title);
    childItems.push({
      id: elink,
      type: "url",
      title: epName,
      name: epName,
      mediaType: "movie",
      seasonNumber: 1,
      episodeNumber: parseInt(ep, 10) || i + 1,
      link: elink
    });
  }

  return {
    id: baseLink,
    type: "url",
    title: title,
    name: title,
    vod_name: title,
    originalTitle: title,
    description: [remarks, desc].filter(Boolean).join("\n"),
    mediaType: "movie",
    link: baseLink,
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    episodeItems: childItems,
    childItems: childItems
  };
}

async function loadResource(params) {
  params = params || {};
  var raw = t(params.link || params.id || "");
  if (!raw && params.item) raw = t(params.item.link || params.item.id || "");
  var p = parseLink(raw);
  if (!p.key || !p.id) return [];
  var ep = p.ep || "1";
  var qs = [];
  if (p.src) qs.push("src=" + encodeURIComponent(p.src));
  if (p.sub) qs.push("sub=" + encodeURIComponent(p.sub));
  var data = await apiGet(
    "/api/play/" +
      encodeURIComponent(p.key) +
      "/" +
      encodeURIComponent(p.id) +
      "/" +
      encodeURIComponent(ep),
    qs.join("&")
  );
  var pl = (data && data.play) || {};
  if (pl.locked) return [];
  var src = t(pl.src || "");
  var proxy = t(pl.src_proxy || "");
  var hdrs = { "User-Agent": UA, Referer: BASE + "/" };
  var lines = [];
  if (src) {
    lines.push({
      name: "线路一·直连",
      description: t(pl.type || "直链"),
      url: absUrl(src),
      playerType: "app",
      customHeaders: hdrs
    });
  }
  if (proxy) {
    lines.push({
      name: "线路二·中转",
      description: "站内中转",
      url: absUrl(proxy),
      playerType: "app",
      customHeaders: hdrs
    });
  }
  return lines;
}
