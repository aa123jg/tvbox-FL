/**
 * 蝙蝠视频 ForwardWidget v1.0.0
 * 源: https://257915.xyz
 * 外层反转 base64 + document.write(d()) 解混淆
 * t.me/nostremby
 */
WidgetMetadata = {
  id: "forward.bianfu.tut",
  title: "蝙蝠视频",
  version: "1.1.1",
  requiredVersion: "0.0.1",
  description: "蝙蝠视频 · 分类与官网一致 | t.me/nostremby",
  author: "宝宝巴士",
  logo: "https://fwd.uou.qzz.io/icon.png",
  site: "https://t.me/nostremby",
  detailCacheDuration: 180,
  modules: [
    {
      id: "home",
      title: "首页推荐",
      functionName: "loadHome",
      cacheDuration: 600,
      params: [
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "home",
          enumOptions: [
            { title: "首页推荐", value: "home" },
            { title: "中文字幕", value: "64360061" },
            { title: "网红主播", value: "64370061" },
            { title: "成人动漫", value: "64380061" },
            { title: "欧美情色", value: "64390061" },
            { title: "国模私拍", value: "64400061" },
            { title: "韩国伦理", value: "64430061" },
            { title: "国产情色", value: "64170061" },
            { title: "日本无码", value: "64180061" },
            { title: "日韩无码", value: "64170041" },
            { title: "欧美精品", value: "64190041" },
            { title: "国产精品", value: "64200041" },
            { title: "中文字幕·2", value: "64340041" },
            { title: "动漫精品", value: "64360041" },
            { title: "日韩精品", value: "64390041" },
            { title: "自拍偷拍", value: "64430041" },
            { title: "大秀视频", value: "64580041" },
            { title: "精品推荐", value: "64360111" },
            { title: "国产色情", value: "64380111" },
            { title: "主播直播", value: "64390111" },
            { title: "91探花", value: "64630111" },
            { title: "传媒出品", value: "64750111" },
            { title: "自拍偷拍·3", value: "64500111" },
            { title: "日本精品", value: "64530111" },
            { title: "欧美精品·3", value: "64460111" },
            { title: "国产自拍", value: "64170031" },
            { title: "欧美极品", value: "64180031" },
            { title: "日韩无码·4", value: "64190031" },
            { title: "中文字幕·4", value: "64360031" },
            { title: "动漫精品·4", value: "64370031" },
            { title: "极骚萝莉", value: "64380031" },
            { title: "三级自慰", value: "64410031" },
            { title: "强奸乱伦", value: "64420031" },
            { title: "国产专区", value: "64169922" },
            { title: "日本有码", value: "64179922" },
            { title: "日本无码·磁", value: "64189922" },
            { title: "欧美色情", value: "64199922" },
            { title: "传媒作品", value: "64209922" },
            { title: "探花直播", value: "64219922" },
            { title: "网黄女神", value: "64229922" },
            { title: "绿帽淫妻", value: "64239922" },
            { title: "麻豆传媒", value: "64180121" }
          ]
        },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "l1",
      title: "中文字幕",
      functionName: "loadL1",
      cacheDuration: 600,
      params: [
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "64360061",
          enumOptions: [
            { title: "中文字幕", value: "64360061" },
            { title: "网红主播", value: "64370061" },
            { title: "成人动漫", value: "64380061" },
            { title: "欧美情色", value: "64390061" },
            { title: "国模私拍", value: "64400061" },
            { title: "韩国伦理", value: "64430061" },
            { title: "国产情色", value: "64170061" },
            { title: "日本无码", value: "64180061" }
          ]
        },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "l2",
      title: "日韩无码",
      functionName: "loadL2",
      cacheDuration: 600,
      params: [
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "64170041",
          enumOptions: [
            { title: "日韩无码", value: "64170041" },
            { title: "欧美精品", value: "64190041" },
            { title: "国产精品", value: "64200041" },
            { title: "中文字幕", value: "64340041" },
            { title: "动漫精品", value: "64360041" },
            { title: "日韩精品", value: "64390041" },
            { title: "自拍偷拍", value: "64430041" },
            { title: "大秀视频", value: "64580041" }
          ]
        },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "l3",
      title: "精品推荐",
      functionName: "loadL3",
      cacheDuration: 600,
      params: [
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "64360111",
          enumOptions: [
            { title: "精品推荐", value: "64360111" },
            { title: "国产色情", value: "64380111" },
            { title: "主播直播", value: "64390111" },
            { title: "91探花", value: "64630111" },
            { title: "传媒出品", value: "64750111" },
            { title: "自拍偷拍", value: "64500111" },
            { title: "日本精品", value: "64530111" },
            { title: "欧美精品", value: "64460111" }
          ]
        },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "l4",
      title: "国产自拍",
      functionName: "loadL4",
      cacheDuration: 600,
      params: [
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "64170031",
          enumOptions: [
            { title: "国产自拍", value: "64170031" },
            { title: "欧美极品", value: "64180031" },
            { title: "日韩无码", value: "64190031" },
            { title: "中文字幕", value: "64360031" },
            { title: "动漫精品", value: "64370031" },
            { title: "极骚萝莉", value: "64380031" },
            { title: "三级自慰", value: "64410031" },
            { title: "强奸乱伦", value: "64420031" }
          ]
        },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "magnet",
      title: "国产专区",
      functionName: "loadMagnet",
      cacheDuration: 600,
      params: [
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "64169922",
          enumOptions: [
            { title: "国产专区", value: "64169922" },
            { title: "日本有码", value: "64179922" },
            { title: "日本无码", value: "64189922" },
            { title: "欧美色情", value: "64199922" },
            { title: "传媒作品", value: "64209922" },
            { title: "探花直播", value: "64219922" },
            { title: "网黄女神", value: "64229922" },
            { title: "绿帽淫妻", value: "64239922" }
          ]
        },
        { name: "page", title: "页码", type: "page" }
      ]
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

var SITE = "https://257915.xyz";
var UA =
  "Mozilla/5.0 (Linux; Android 13; SM-S9080) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function t(v) {
  return String(v == null ? "" : v).trim();
}

function headers(referer) {
  return {
    "User-Agent": UA,
    Referer: referer || SITE + "/",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };
}

function absUrl(u) {
  u = t(u);
  if (!u) return "";
  if (u.indexOf("//") === 0) return "https:" + u;
  if (u.indexOf("http") === 0) return u;
  if (u.charAt(0) === "/") return SITE + u;
  return SITE + "/" + u;
}

function fillCover(item, pic) {
  var url = absUrl(pic);
  if (!url) return item;
  item.coverUrl = url;
  item.posterPath = url;
  item.backdropPath = url;
  item.detailPoster = url;
  item.pic = url;
  item.cover = url;
  return item;
}

function b64decode(str) {
  str = t(str).replace(/[\r\n\s]/g, "");
  if (!str) return "";
  if (typeof atob === "function") {
    try {
      return atob(str);
    } catch (e) {}
  }
  var table =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var out = [];
  var i = 0;
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  while (i < str.length) {
    var a = table.indexOf(str.charAt(i++));
    var b = table.indexOf(str.charAt(i++));
    var c = table.indexOf(str.charAt(i++));
    var d = table.indexOf(str.charAt(i++));
    var n = (a << 18) | (b << 12) | ((c & 63) << 6) | (d & 63);
    if (c !== 64 && c !== -1) out.push((n >> 16) & 255);
    if (d !== 64 && d !== -1) {
      out.push((n >> 8) & 255);
      out.push(n & 255);
    } else if (c !== 64 && c !== -1) {
      out.push((n >> 8) & 255);
    }
  }
  var s = "";
  for (var j = 0; j < out.length; j++) s += String.fromCharCode(out[j]);
  try {
    return decodeURIComponent(escape(s));
  } catch (e2) {
    return s;
  }
}

function reverseStr(s) {
  return s.split("").reverse().join("");
}

function cleanText(s) {
  s = t(s).replace(/<[^>]+>/g, "");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return s.replace(/\s+/g, " ").trim();
}

async function fetchRaw(url, referer) {
  var res = await Widget.http.get(url, { headers: headers(referer || SITE + "/") });
  var body = res && (res.data != null ? res.data : res);
  if (typeof body !== "string") {
    try {
      body = JSON.stringify(body);
    } catch (e) {
      body = String(body || "");
    }
  }
  return body || "";
}

/** 解混淆页面 */
async function fetchPage(url) {
  var html = await fetchRaw(url);
  if (!html) return "";
  var m = html.match(/\w+\('([A-Za-z0-9+/=]{1000,})/);
  var page = html;
  if (m) {
    try {
      var raw = b64decode(reverseStr(m[1]));
      var idx = raw.indexOf("<!DOCTYPE");
      if (idx < 0) idx = raw.indexOf("<html");
      page = idx >= 0 ? raw.slice(idx) : raw;
    } catch (e) {
      page = html;
    }
  }
  page = page.replace(/document\.write\(d\('([^']+)'\)\);/g, function (_, b64) {
    try {
      return b64decode(b64);
    } catch (e) {
      return "";
    }
  });
  page = page.replace(
    /<span[^>]*?display\s*:\s*none[^>]*?>[\s\S]*?<\/span>/gi,
    ""
  );
  return page;
}

function parseList(html) {
  var items = [];
  var seen = {};
  if (!html) return items;
  var blocks = html.split(/<dl>/i);
  for (var i = 1; i < blocks.length; i++) {
    var dl = blocks[i].split(/<\/dl>/i)[0] || "";
    var am =
      dl.match(/href="((?:\/video\.php|\/torrent\.php)\?id=\d+)"/i) ||
      dl.match(/href="(\/video\.php\?id=\d+)"/i);
    if (!am) continue;
    var path = am[1];
    if (seen[path]) continue;
    seen[path] = 1;
    var im = dl.match(/<img[^>]+src="([^"]+)"/i);
    var pic = im ? im[1] : "";
    var tm = dl.match(/<h3>([\s\S]*?)<\/h3>/i);
    var name = cleanText(tm ? tm[1] : "");
    if (!name || name.length > 120) continue;
    var link =
      "bf:" + path + "||" + encodeURIComponent(name);
    var item = {
      id: link,
      type: "url",
      title: name,
      name: name,
      mediaType: "movie",
      link: link,
      description: path.indexOf("torrent") >= 0 ? "磁力" : ""
    };
    items.push(fillCover(item, pic));
  }
  return items;
}

async function loadHome(params) {
  params = params || {};
  var page = parseInt(params.page, 10) || 1;
  var tid = t(params.tid || "home");
  // 右上角选了具体分类 → 走 list.php
  if (tid && tid !== "home") {
    return loadCat(tid, page);
  }
  // 默认：第 1 页抓首页推荐，翻页落到中文字幕
  if (page > 1) return loadCat("64360061", page);
  var html = await fetchPage(SITE + "/");
  return parseList(html);
}

async function loadCat(tid, page) {
  tid = t(tid) || "64360061";
  page = parseInt(page, 10) || 1;
  var url = SITE + "/list.php?id=" + encodeURIComponent(tid) + "&page=" + page;
  var html = await fetchPage(url);
  return parseList(html);
}

async function loadL1(params) {
  params = params || {};
  return loadCat(params.tid || "64360061", params.page);
}
async function loadL2(params) {
  params = params || {};
  return loadCat(params.tid || "64170041", params.page);
}
async function loadL3(params) {
  params = params || {};
  return loadCat(params.tid || "64360111", params.page);
}
async function loadL4(params) {
  params = params || {};
  return loadCat(params.tid || "64170031", params.page);
}
async function loadMagnet(params) {
  params = params || {};
  return loadCat(params.tid || "64169922", params.page);
}

async function search(params) {
  params = params || {};
  var kw = t(params.keyword || params.wd || params.q);
  if (!kw) return [];
  var out = [];
  var seen = {};
  for (var ti = 0; ti < 2; ti++) {
    var stype = String(ti + 1);
    var url =
      SITE +
      "/search.php?content=" +
      encodeURIComponent(kw) +
      "&type=" +
      stype;
    try {
      var html = await fetchPage(url);
      var list = parseList(html);
      for (var i = 0; i < list.length; i++) {
        if (!seen[list[i].id]) {
          seen[list[i].id] = 1;
          out.push(list[i]);
        }
      }
    } catch (e) {}
  }
  return out;
}

function parseLink(link) {
  var listTitle = "";
  if (typeof link === "object" && link) {
    listTitle = t(link.title || link.name || "");
    link = link.link || link.id || "";
  }
  link = t(link);
  if (link.indexOf("bf:") === 0) link = link.slice(3);
  if (link.indexOf("bfplay:") === 0) {
    var body = link.slice(7);
    try {
      body = decodeURIComponent(body);
    } catch (e) {}
    return { play: body, path: "", listTitle: listTitle };
  }
  var emb = "";
  var di = link.indexOf("||");
  if (di >= 0) {
    emb = link.slice(di + 2);
    link = link.slice(0, di);
    try {
      emb = decodeURIComponent(emb);
    } catch (e) {}
  }
  return { path: link, play: "", listTitle: listTitle || emb };
}

async function loadDetail(link) {
  var p = parseLink(link);
  var path = p.path;
  if (!path) return null;
  var listTitle = p.listTitle;
  var html = await fetchPage(absUrl(path));
  var title = listTitle || "";
  if (!title && html) {
    var hm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (hm) title = cleanText(hm[1]);
  }
  title = title || path;

  var pic = "";
  var pm = html && html.match(/<img[^>]+src="([^"]+)"/i);
  if (pm) pic = pm[1];

  var episodeItems = [];
  var hdrs = headers(SITE + "/");

  if (path.indexOf("torrent") >= 0) {
    var mm = html && html.match(/magnet:\?[^\s"'<>]+/i);
    if (mm) {
      episodeItems.push({
        id: "bfplay:" + encodeURIComponent(mm[0]),
        type: "url",
        title: title,
        name: title,
        mediaType: "movie",
        seasonNumber: 1,
        episodeNumber: 1,
        link: "bfplay:" + encodeURIComponent(mm[0]),
        playerType: "app",
        customHeaders: hdrs
      });
    }
  } else {
    var m2 =
      html &&
      html.match(/playFilteredHLS\s*\(\s*['"]video['"]\s*,\s*['"]([^'"]+)['"]/i);
    if (m2) {
      var playUrl = t(m2[1]);
      episodeItems.push({
        id: "bfplay:" + encodeURIComponent(playUrl),
        type: "url",
        title: title,
        name: title,
        mediaType: "movie",
        seasonNumber: 1,
        episodeNumber: 1,
        link: "bfplay:" + encodeURIComponent(playUrl),
        videoUrl: playUrl,
        url: playUrl,
        playerType: "app",
        customHeaders: hdrs
      });
    }
  }

  var detail = {
    id: "bf:" + path + "||" + encodeURIComponent(title),
    type: "url",
    title: title,
    name: title,
    mediaType: "movie",
    link: "bf:" + path + "||" + encodeURIComponent(title),
    episodeItems: episodeItems,
    childItems: episodeItems,
    customHeaders: hdrs
  };
  if (episodeItems.length && episodeItems[0].videoUrl) {
    detail.videoUrl = episodeItems[0].videoUrl;
    detail.playerType = "app";
  }
  return fillCover(detail, pic);
}

async function loadResource(params) {
  params = params || {};
  var raw = t(params.link || params.id || "");
  if (!raw && params.item) raw = t(params.item.link || params.item.id || "");
  var hdrs = headers(SITE + "/");
  var p = parseLink(raw);

  if (p.play) {
    var u = p.play;
    if (u.indexOf("magnet:") === 0) {
      return [{ name: "磁力", url: u, playerType: "app", customHeaders: hdrs }];
    }
    return [{ name: "在线", url: u, playerType: "app", customHeaders: hdrs }];
  }
  if (p.path) {
    var d = await loadDetail("bf:" + p.path);
    if (d && d.episodeItems && d.episodeItems.length) {
      return loadResource({ link: d.episodeItems[0].link });
    }
  }
  if (/^https?:\/\//i.test(raw) || raw.indexOf("magnet:") === 0) {
    return [{ name: "播放", url: raw, playerType: "app", customHeaders: hdrs }];
  }
  return [];
}
