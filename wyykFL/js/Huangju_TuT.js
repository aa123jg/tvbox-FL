/**
 * 红果黄剧 ForwardWidget (huangju.net)
 * 列表/详情走 api.huangju.net
 * 播放：优先 playProxy 拿签名 URL（App 读不到 Set-Cookie）；本地能抠到 Cookie 则双线路
 */
WidgetMetadata = {
  id: "forward.huangju.tut",
  title: "红果黄剧",
  version: "1.6.2",
  requiredVersion: "0.0.1",
  description: "huangju.net：分类/搜索/分集；播放需签名（建议配置 playProxy）| 宝宝巴士乐园 t.me/nostremby",
  author: "宝宝巴士",
  site: "https://t.me/nostremby",
  detailCacheDuration: 120,
  globalParams: [
    {
      name: "apiBase",
      title: "API 地址",
      type: "input",
      value: "https://api.huangju.net"
    },
    {
      name: "playProxy",
      title: "播放签名代理",
      type: "input",
      value: "https://play.uou.qzz.io"
    },
    {
      name: "playProxyToken",
      title: "播放代理 Token",
      type: "input",
      value: ""
    }
  ],
  modules: [
    { id: "hot", title: "热门", functionName: "loadHot", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "latest", title: "最新", functionName: "loadLatest", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-adult", title: "成人", functionName: "loadAdult", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-mo-gai", title: "魔改", functionName: "loadMoGai", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-romance", title: "爱情甜宠", functionName: "loadRomanceGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-urban", title: "都市", functionName: "loadUrban", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-fantasy", title: "玄幻脑洞", functionName: "loadFantasyGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-suspense", title: "悬疑", functionName: "loadSuspense", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-rebirth", title: "穿越重生", functionName: "loadRebirthGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-xianxia", title: "仙侠古装", functionName: "loadXianXiaGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-youth", title: "青春校园", functionName: "loadYouthGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-family", title: "家庭情感", functionName: "loadFamilyGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-counter", title: "逆袭复仇", functionName: "loadCounterGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-horror", title: "灵异恐怖", functionName: "loadHorrorGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "cat-original", title: "原创精选", functionName: "loadOriginalGroup", cacheDuration: 1800, params: [{ name: "page", title: "页码", type: "page" }] },
    {
      id: "loadResource",
      title: "解析播放",
      functionName: "loadResource",
      type: "stream",
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

var DEFAULT_API = "https://api.huangju.net";
var SITE = "https://huangju.net";
var HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  Origin: SITE,
  Referer: SITE + "/"
};
var SKIP_REDIRECT_PROBE_HEADER = "X-Forward-Skip-Redirect-Probe";
var TOKEN_KEY = "hj_token";
var DEVICE_KEY = "hj_device";

function t(v) {
  return String(v == null ? "" : v).trim();
}

function cfg(params) {
  params = params || {};
  return {
    apiBase: t(params.apiBase || DEFAULT_API).replace(/\/+$/, ""),
    playProxy: t(params.playProxy || "").replace(/\/+$/, ""),
    playProxyToken: t(params.playProxyToken || "")
  };
}

function buildQuery(obj) {
  var parts = [];
  for (var k in obj) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === "") continue;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k])));
  }
  return parts.join("&");
}

function getDeviceId() {
  var id = "";
  try {
    id = Widget.storage.get(DEVICE_KEY);
  } catch (e) {}
  if (!id) {
    id =
      "fw-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10);
    try {
      Widget.storage.set(DEVICE_KEY, id);
    } catch (e) {}
  }
  return id;
}

async function ensureToken(c) {
  var token = "";
  try {
    token = Widget.storage.get(TOKEN_KEY);
  } catch (e) {}
  if (token) return token;
  var res = await Widget.http.post(
    c.apiBase + "/auth/guest",
    { deviceId: getDeviceId() },
    {
      headers: Object.assign({}, HEADERS, {
        "Content-Type": "application/json"
      })
    }
  );
  var body = res && res.data !== undefined ? res.data : res;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      throw new Error("guest 登录失败");
    }
  }
  token = body && body.token;
  if (!token) throw new Error("guest 无 token");
  try {
    Widget.storage.set(TOKEN_KEY, token);
  } catch (e) {}
  return token;
}

function extractCloudFrontJar(res) {
  var jar = {};
  function eatCookieLine(line) {
    var m = String(line).match(
      /(CloudFront-(?:Policy|Signature|Key-Pair-Id))=([^;\s]+)/i
    );
    if (m) jar[m[1]] = m[2];
  }
  function walk(node, depth) {
    if (node == null || depth > 8) return;
    if (typeof node === "string") {
      if (node.indexOf("CloudFront-") >= 0) {
        node.split(/[\r\n,]/).forEach(eatCookieLine);
        var re =
          /CloudFront-(Policy|Signature|Key-Pair-Id)=([A-Za-z0-9_=~\-\/\+]+)/g;
        var m;
        while ((m = re.exec(node))) {
          jar["CloudFront-" + m[1]] = m[2];
        }
      }
      return;
    }
    if (typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(function (x) {
        walk(x, depth + 1);
      });
      return;
    }
    Object.keys(node).forEach(function (k) {
      var lk = String(k).toLowerCase();
      var v = node[k];
      if (
        lk === "set-cookie" ||
        lk === "set_cookie" ||
        lk === "cookie" ||
        lk.indexOf("cookie") >= 0
      ) {
        if (Array.isArray(v))
          v.forEach(function (x) {
            eatCookieLine(x);
            walk(x, depth + 1);
          });
        else eatCookieLine(v);
      }
      walk(v, depth + 1);
    });
  }
  walk(res, 0);
  if (
    jar["CloudFront-Policy"] &&
    jar["CloudFront-Signature"] &&
    jar["CloudFront-Key-Pair-Id"]
  ) {
    return jar;
  }
  return null;
}

function signUrl(rawUrl, jar) {
  if (!rawUrl || !jar) return "";
  var join = rawUrl.indexOf("?") >= 0 ? "&" : "?";
  return (
    rawUrl +
    join +
    "Policy=" +
    encodeURIComponent(jar["CloudFront-Policy"]) +
    "&Signature=" +
    encodeURIComponent(jar["CloudFront-Signature"]) +
    "&Key-Pair-Id=" +
    encodeURIComponent(jar["CloudFront-Key-Pair-Id"])
  );
}

function cookieHeader(jar) {
  if (!jar) return "";
  return (
    "CloudFront-Policy=" +
    jar["CloudFront-Policy"] +
    "; CloudFront-Signature=" +
    jar["CloudFront-Signature"] +
    "; CloudFront-Key-Pair-Id=" +
    jar["CloudFront-Key-Pair-Id"]
  );
}

async function httpGet(c, url, withAuth) {
  var headers = Object.assign({}, HEADERS);
  if (withAuth) {
    try {
      headers.Authorization = "Bearer " + (await ensureToken(c));
    } catch (e) {
      console.error("[auth]", e.message || e);
    }
  }
  var res = await Widget.http.get(url, { headers: headers });
  if (res == null) throw new Error("无响应: " + url);
  var body = res.data !== undefined ? res.data : res;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }
  if (body && body.statusCode === 401 && withAuth) {
    try {
      Widget.storage.set(TOKEN_KEY, "");
    } catch (e) {}
    headers.Authorization = "Bearer " + (await ensureToken(c));
    var res2 = await Widget.http.get(url, { headers: headers });
    body = res2 && res2.data !== undefined ? res2.data : res2;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }
    return { body: body, res: res2 };
  }
  return { body: body, res: res };
}

function parseEpisodeId(params) {
  params = params || {};
  var episodeId = "";
  var link = t(params.link || "");
  if (link.indexOf("play:") === 0) episodeId = link.slice(5);
  else if (params.id && String(params.id).indexOf("play:") === 0)
    episodeId = String(params.id).slice(5);
  else if (/^\d+$/.test(String(params.id || ""))) episodeId = String(params.id);
  else if (params.episodeId) episodeId = String(params.episodeId);
  else if (/^\d+$/.test(link)) episodeId = link;
  if (episodeId.indexOf(":") >= 0) {
    var p = episodeId.split(":");
    episodeId = p[p.length - 1];
  }
  return t(episodeId);
}

/** 优先走 playProxy（JSON 里直接给签名 URL） */
async function fetchViaProxy(c, episodeId) {
  if (!c.playProxy) return null;
  var q = { episodeId: episodeId };
  if (c.playProxyToken) q.token = c.playProxyToken;
  var urls = [
    c.playProxy + "/?" + buildQuery(q),
    c.playProxy + "/play/" + encodeURIComponent(episodeId) +
      (c.playProxyToken ? "?token=" + encodeURIComponent(c.playProxyToken) : "")
  ];
  for (var i = 0; i < urls.length; i++) {
    try {
      var res = await Widget.http.get(urls[i], {
        headers: {
          Accept: "application/json",
          "User-Agent": HEADERS["User-Agent"]
        }
      });
      var body = res && res.data !== undefined ? res.data : res;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      if (body && (body.ok || body.url || body.rawUrl)) return body;
    } catch (e) {
      console.error("[playProxy try]", urls[i], e.message || e);
    }
  }
  return null;
}

async function fetchPlayGrant(c, episodeId) {
  episodeId = t(String(episodeId || "").replace(/^play:/, ""));
  if (!episodeId) throw new Error("空 episodeId");

  // 1) 代理（推荐）
  try {
    var proxied = await fetchViaProxy(c, episodeId);
    if (proxied && (proxied.url || proxied.rawUrl || proxied.signedUrl)) {
      var jar = null;
      if (proxied.cookies && proxied.cookies["CloudFront-Policy"]) {
        jar = {
          "CloudFront-Policy": proxied.cookies["CloudFront-Policy"],
          "CloudFront-Signature": proxied.cookies["CloudFront-Signature"],
          "CloudFront-Key-Pair-Id": proxied.cookies["CloudFront-Key-Pair-Id"]
        };
      } else if (proxied.cookie && proxied.cookie.indexOf("CloudFront-Policy=") >= 0) {
        jar = {};
        var parts = String(proxied.cookie).split(";");
        for (var pi = 0; pi < parts.length; pi++) {
          var kv = parts[pi].trim().split("=");
          if (kv.length >= 2 && kv[0].indexOf("CloudFront-") === 0) {
            jar[kv[0]] = kv.slice(1).join("=");
          }
        }
        if (!jar["CloudFront-Policy"]) jar = null;
      }
      return {
        rawUrl: proxied.rawUrl || "",
        signedUrl: proxied.signedUrl || proxied.url || "",
        jar: jar,
        expiresAt: proxied.expiresAt,
        via: jar ? "proxy-cookie" : "proxy"
      };
    }
  } catch (e) {
    console.error("[playProxy]", e.message || e);
  }

  // 2) 直连 api（依赖 App 是否透传 Set-Cookie）
  var pack = await httpGet(c, c.apiBase + "/play/" + episodeId, true);
  if (!pack.body || !pack.body.url) {
    pack = await httpGet(c, c.apiBase + "/play/" + episodeId, false);
  }
  if (!pack.body || !pack.body.url) throw new Error("play 无 url");
  var jar = extractCloudFrontJar(pack.res) || extractCloudFrontJar(pack.body);
  var signed = jar ? signUrl(pack.body.url, jar) : "";
  return {
    rawUrl: pack.body.url,
    signedUrl: signed,
    jar: jar,
    expiresAt: pack.body.expiresAt,
    via: jar ? "direct-jar" : "direct-naked"
  };
}

function buildStreamResources(grant) {
  var list = [];
  // 优先 Cookie：子级 m3u8/ts 也能带上，避免只签 master 导致 403
  if (grant.jar && grant.rawUrl) {
    var ck = cookieHeader(grant.jar);
    if (ck) {
      list.push({
        name: "Cookie线路",
        url: grant.rawUrl,
        description: "CloudFront Cookie（推荐，整条 HLS 可用）",
        playerType: "app",
        customHeaders: {
          Cookie: ck,
          Referer: SITE + "/",
          Origin: SITE,
          "User-Agent": HEADERS["User-Agent"],
          "X-Forward-Skip-Redirect-Probe": "1"
        }
      });
    }
  }
  if (grant.signedUrl) {
    list.push({
      name: "签名直链",
      url: grant.signedUrl,
      description:
        "仅 master 带 Query；子清单可能 403，优先用 Cookie 线路",
      playerType: "app",
      customHeaders: {
        Referer: SITE + "/",
        Origin: SITE,
        "User-Agent": HEADERS["User-Agent"],
        "X-Forward-Skip-Redirect-Probe": "1"
      }
    });
  }
  if (!list.length && grant.rawUrl) {
    list.push({
      name: "默认(可能403)",
      url: grant.rawUrl,
      description: "无签名：请配置 playProxy 并更新 worker",
      playerType: "app",
      customHeaders: {
        Referer: SITE + "/",
        Origin: SITE,
        "User-Agent": HEADERS["User-Agent"]
      }
    });
  }
  return list;
}

function mapDramaItem(d) {
  var id = d.id;
  var slug = d.slug || "";
  var linkKey = slug ? slug + "-" + id : String(id);
  var statusText = "";
  if (d.status === "completed") statusText = "全" + (d.totalEpisodes || "?") + "集";
  else if (d.totalEpisodes) statusText = "更新至" + d.totalEpisodes + "集";
  var cover = d.coverUrl || d.coverHUrl || "";
  return {
    id: String(id),
    type: "url",
    title: d.title || linkKey,
    posterPath: cover,
    coverUrl: cover,
    backdropPath: cover,
    rating: d.score != null ? Number(d.score) : undefined,
    description: statusText,
    releaseDate: (d.publishedAt || "").slice(0, 10),
    mediaType: "tv",
    link: "detail:" + linkKey
  };
}

async function fetchDramaList(c, query) {
  var pack = await httpGet(c, c.apiBase + "/dramas?" + buildQuery(query), false);
  return ((pack.body && pack.body.items) || []).map(mapDramaItem);
}

async function fetchMergedCategories(c, slugs, page) {
  var pageNum = Number(page || 1);
  var results = await Promise.all(
    slugs.map(function (slug) {
      return fetchDramaList(c, {
        category: slug,
        page: pageNum,
        pageSize: 20
      }).catch(function (e) {
        console.error("[merge]", slug, e.message || e);
        return [];
      });
    })
  );
  var seen = {};
  var out = [];
  results.forEach(function (list) {
    list.forEach(function (item) {
      if (seen[item.id]) return;
      seen[item.id] = true;
      out.push(item);
    });
  });
  if (!out.length) throw new Error("列表为空");
  return out;
}

async function loadHot(params) {
  var c = cfg(params);
  return fetchDramaList(c, {
    page: Number((params && params.page) || 1),
    pageSize: 20,
    sort: "hot"
  });
}
async function loadLatest(params) {
  var c = cfg(params);
  return fetchDramaList(c, {
    page: Number((params && params.page) || 1),
    pageSize: 20,
    sort: "latest"
  });
}
async function loadAdult(params) {
  return fetchMergedCategories(cfg(params), ["adult"], (params && params.page) || 1);
}
async function loadMoGai(params) {
  return fetchMergedCategories(cfg(params), ["mo-gai"], (params && params.page) || 1);
}
async function loadUrban(params) {
  return fetchMergedCategories(cfg(params), ["urban"], (params && params.page) || 1);
}
async function loadSuspense(params) {
  return fetchMergedCategories(cfg(params), ["suspense"], (params && params.page) || 1);
}
async function loadRomanceGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["romance", "modern-romance", "ancient-romance", "sweet-love"],
    (params && params.page) || 1
  );
}
async function loadFantasyGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["fantasy", "brain-hole", "xi-ju"],
    (params && params.page) || 1
  );
}
async function loadRebirthGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["chuan-yue", "rebirth"],
    (params && params.page) || 1
  );
}
async function loadXianXiaGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["xian-xia", "costume", "gong-dou", "wu-xia", "qi-huan"],
    (params && params.page) || 1
  );
}
async function loadYouthGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["qing-chun", "xiao-yuan"],
    (params && params.page) || 1
  );
}
async function loadFamilyGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["family", "tong-ju", "gui-mi", "lao-shi"],
    (params && params.page) || 1
  );
}
async function loadCounterGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["war-god", "revenge", "counterattack", "son-in-law"],
    (params && params.page) || 1
  );
}
async function loadHorrorGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["ling-yi", "kong-bu", "jing-song"],
    (params && params.page) || 1
  );
}
async function loadOriginalGroup(params) {
  return fetchMergedCategories(
    cfg(params),
    ["du-jia-yuan-chuang", "yuan-chuang"],
    (params && params.page) || 1
  );
}

async function search(params) {
  var c = cfg(params);
  var kw = t((params && params.keyword) || "");
  if (!kw) return [];
  return fetchDramaList(c, {
    q: kw,
    page: Number((params && params.page) || 1),
    pageSize: 20
  });
}

async function loadResource(params) {
  try {
    var c = cfg(params);
    var episodeId = parseEpisodeId(params);
    if (!episodeId) {
      throw new Error(
        "无法解析集 ID，params=" +
          JSON.stringify({
            link: params && params.link,
            id: params && params.id
          })
      );
    }
    var grant = await fetchPlayGrant(c, episodeId);
    var list = buildStreamResources(grant);
    if (!list.length) throw new Error("无可用播放地址");
    return list;
  } catch (e) {
    console.error("[loadResource]", e.message || e);
    throw e;
  }
}

async function loadDetail(link) {
  try {
    var c = cfg({});
    var key = t(String(link || "").replace(/^detail:/, ""));
    if (!key) return null;
    var pack = await httpGet(
      c,
      c.apiBase + "/dramas/" + encodeURIComponent(key),
      false
    );
    var detail = pack.body;
    if (!detail || !detail.id) return null;
    var dramaId = detail.id;
    var episodes = (detail.episodes || []).map(function (ep) {
      var epNo = ep.epNo != null ? ep.epNo : 0;
      return {
        id: String(dramaId) + "-" + String(epNo),
        type: "url",
        title: "第" + epNo + "集",
        mediaType: "tv",
        seasonNumber: 1,
        episodeNumber: Number(epNo) || 0,
        duration: ep.durationSec || undefined,
        videoUrl: "",
        link: "play:" + ep.id,
        playerType: "app"
      };
    });
    var tags = [];
    if (detail.category && detail.category.name) {
      tags.push({
        id: detail.category.slug || detail.category.name,
        title: detail.category.name
      });
    }
    var cover = detail.coverUrl || detail.coverHUrl || "";
    return {
      id: String(detail.id),
      type: "url",
      title: detail.title || key,
      posterPath: cover,
      coverUrl: cover,
      backdropPath: detail.coverHUrl || cover,
      description: detail.description || "",
      rating: detail.score != null ? Number(detail.score) : undefined,
      releaseDate: (detail.publishedAt || "").slice(0, 10),
      mediaType: "tv",
      link: "detail:" + (detail.slug || "") + "-" + detail.id,
      genreItems: tags,
      episodeItems: episodes,
      videoUrl: "",
      playerType: "app"
    };
  } catch (e) {
    console.error("[loadDetail]", e.message || e);
    throw e;
  }
}
