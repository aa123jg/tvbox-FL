import re
import ast
import ssl
import json
import gzip
import time
import urllib.request
import urllib.parse

try:
    import requests
except Exception:
    requests = None

try:
    from base.spider import Spider as _BaseSpider
except Exception:
    _BaseSpider = object


class Spider(_BaseSpider):
    RELEASE = 'https://618069.xyz'
    PLAY_FALLBACK = 'https://h5.xxoo475.org'
    UA = 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    LIMIT = 20
    _HOST = ''
    _PLAY = ''

    def init(self, extend=''):
        self.extend = extend or ''
        self.headers = {'User-Agent': self.UA}

    def getName(self):
        return '618视频'

    def isVip(self):
        return 0

    def _xor(self, t):
        return ''.join(chr(ord(c) ^ 128) for c in t)

    def _fetch(self, url, referer=None, tries=3):
        headers = dict(self.headers)
        if referer:
            headers['Referer'] = referer
        last = None
        for _ in range(tries):
            try:
                if requests is not None:
                    r = requests.get(url, headers=headers, timeout=20, verify=False)
                    return r.content.decode('utf-8', 'ignore')
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                req = urllib.request.Request(url, headers=headers)
                r = urllib.request.urlopen(req, timeout=20, context=ctx)
                raw = r.read()
                if r.headers.get('Content-Encoding') == 'gzip':
                    raw = gzip.decompress(raw)
                return raw.decode('utf-8', 'ignore')
            except Exception as e:
                last = e
                time.sleep(1.2)
        return ''

    def _fetch_json(self, url, referer=None):
        for _ in range(3):
            s = self._fetch(url, referer=referer)
            if s:
                try:
                    return json.loads(s)
                except Exception:
                    pass
            time.sleep(1.0)
        return {}

    def _entry_arr(self):
        html = self._fetch(self.RELEASE + '/')
        m = re.search(r'<script src="(https://[^"]+)"', html)
        if not m:
            return []
        js = self._fetch(m.group(1))
        m = re.search(r'const zuArr=(\[.*?\]);for\(', js, re.S)
        if not m:
            return []
        try:
            return ast.literal_eval(m.group(1))
        except Exception:
            return []

    def _probe(self, base):
        s = self._fetch(base + '/index.php/vod/type/id/13.html', referer=self.RELEASE + '/', tries=1)
        if len(s) > 5000 and 'vodbox' in s:
            return base
        return None

    def _host(self):
        if type(self)._HOST:
            return type(self)._HOST
        arr = self._entry_arr()
        host = ''
        if arr and arr[0]:
            import concurrent.futures as cf
            for c in range(len(arr[0])):
                cands = ['https://618' + arr[r][c] + '.xyz' for r in range(len(arr)) if arr[r][c]]
                with cf.ThreadPoolExecutor(min(10, len(cands))) as ex:
                    for ok in ex.map(self._probe, cands):
                        if ok:
                            host = ok
                            break
                if host:
                    break
        if not host:
            host = 'https://618041.xyz'
        type(self)._HOST = host
        return host

    def _abs(self, href):
        if href.startswith('http'):
            return href
        return self._host().rstrip('/') + href

    def _play_host(self):
        if type(self)._PLAY:
            return type(self)._PLAY
        host = self._host()
        try:
            h = self._fetch(host + '/index.php/vod/type/id/1/page/1.html', referer=self.RELEASE + '/')
            href = re.search(r'<a class="vodbox" href="([^"]+)"', h)
            if href:
                dh = self._fetch(self._abs(href.group(1)), referer=host + '/')
                m = re.search(r'(https?://[\w.:-]+)/api/v2/vod/reqplay/', dh)
                if m:
                    type(self)._PLAY = m.group(1)
                    return type(self)._PLAY
        except Exception:
            pass
        type(self)._PLAY = self.PLAY_FALLBACK
        return self.PLAY_FALLBACK

    def _parse_list(self, h, pg):
        tp = re.search(r"const totalPages='(\d+)'", h)
        pagecount = int(tp.group(1)) if tp and tp.group(1).isdigit() else 1
        try:
            cur = int(pg)
        except Exception:
            cur = 1
        videos = []
        for href, body in re.findall(r'<a class="vodbox" href="([^"]*)"[^>]*>(.*?)</a>', h, re.S):
            v = re.search(r'[?&]v=([^&#]+)', href)
            m = re.search(r'[?&]m=([^&#]+)', href)
            if not v and not m:
                continue
            vid = v.group(1) if v else m.group(1)
            p = re.search(r'<p class="km-script">(.*?)</p>', body, re.S)
            title = self._xor(p.group(1)) if p else ''
            pic = re.search(r'data-original="([^"]+)"', body)
            videos.append({
                'vod_id': vid,
                'vod_name': title,
                'vod_pic': pic.group(1) if pic else '',
                'vod_remarks': '',
            })
        return {
            'page': cur,
            'pagecount': pagecount,
            'limit': self.LIMIT,
            'total': pagecount * self.LIMIT,
            'list': videos,
        }

    def homeContent(self, filter):
        host = self._host()
        h = self._fetch(host + '/index.php/vod/type/id/1/page/1.html', referer=self.RELEASE + '/')
        h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
        classes = []
        for tid, name in re.findall(r'<a href="/index\.php/vod/type/id/(\d+)\.html"[^>]*class="km-script">(.*?)</a>', h, re.S):
            classes.append({'type_id': tid, 'type_name': self._xor(name)})
        return {'class': classes, 'filters': {}}

    def homeVideoContent(self):
        host = self._host()
        h = self._fetch(host + '/index.php/vod/type/id/1/page/1.html', referer=self.RELEASE + '/')
        res = self._parse_list(h, 1)
        res['list'] = res['list'][:12]
        return res

    def categoryContent(self, tid, pg, filter=False, extend=None):
        host = self._host()
        url = host + '/index.php/vod/type/id/%s/page/%s.html' % (str(tid).strip(), str(pg).strip())
        h = self._fetch(url, referer=host + '/')
        return self._parse_list(h, pg)

    def detailContent(self, ids):
        mid = ids[0] if isinstance(ids, list) else ids
        vod = {
            'vod_id': str(mid),
            'vod_name': '在线播放',
            'vod_pic': '',
            'vod_play_from': '默认',
            'vod_play_url': '播放$' + str(mid),
        }
        return {'list': [vod]}

    def searchContent(self, key, quick=False, pg='1'):
        host = self._host()
        kw = urllib.parse.quote(str(key), safe='')
        url = host + '/index.php/vod/type/id/1/wd/%s/page/%s.html' % (kw, str(pg))
        h = self._fetch(url, referer=host + '/')
        return self._parse_list(h, pg)

    def playerContent(self, flag, id, vipFlags=False):
        mid = str(id).strip()
        if mid.startswith('http') and '.m3u8' in mid:
            return {
                'parse': 0,
                'url': mid,
                'header': {'User-Agent': self.UA, 'Referer': self._host() + '/'},
            }
        host = self._play_host()
        url = host.rstrip('/') + '/api/v2/vod/reqplay/' + mid
        j = self._fetch_json(url, referer=self._host() + '/')
        data = j.get('data') or {}
        play = ''
        if str(j.get('retcode')) == '3':
            play = (data.get('httpurl_preview') or '').replace('?300', '')
        else:
            play = data.get('httpurl') or ''
        return {
            'parse': 0,
            'url': play,
            'header': {'User-Agent': self.UA, 'Referer': host + '/'},
        }
