"""Explicit GitHub release steps for noharass/WorkMemo; never deletes assets or tags.

Credentials stay in memory via the repository's existing Git credential helper.
Metadata GETs can authenticate when the anonymous API quota is exhausted.
Public release pages and artifact downloads always use a separate anonymous client.
"""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO = 'noharass/WorkMemo'
API = 'https://api.github.com/repos/' + REPO


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Never forward Authorization to a redirect destination.


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('step', choices=['inspect', 'prepare', 'publish', 'verify'])
    parser.add_argument('--commit')
    parser.add_argument('--notes', type=pathlib.Path)
    parser.add_argument('--previous', default='v0.2.10')
    parser.add_argument('--proxy')
    args = parser.parse_args()
    version = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
    if not re.fullmatch(r'\d+\.\d+\.\d+', version):
        raise RuntimeError('Expected a stable release version')
    tag = 'v' + version
    output = ROOT / 'artifacts' / version
    output.mkdir(parents=True, exist_ok=True)
    if args.proxy and urllib.parse.urlparse(args.proxy).hostname not in ['127.0.0.1', 'localhost']:
        raise RuntimeError('Only an explicit local proxy is supported')
    proxies = {'http': args.proxy, 'https': args.proxy} if args.proxy else {}
    public = urllib.request.build_opener(urllib.request.ProxyHandler(proxies))
    private = urllib.request.build_opener(urllib.request.ProxyHandler(proxies), NoRedirect())
    token = None
    if args.step in ['prepare', 'publish']:
        if not args.commit or not re.fullmatch(r'[a-f0-9]{40}', args.commit):
            raise RuntimeError('Supply the exact verified build commit')

    def get_token():
        nonlocal token
        if token:
            return token
        credential = subprocess.run(['git', 'credential', 'fill'], cwd=ROOT,
                                    input='protocol=https\nhost=github.com\n\n',
                                    capture_output=True, text=True, timeout=30)
        if credential.returncode:
            raise RuntimeError('Existing Git credential helper did not return credentials')
        values = dict(line.split('=', 1) for line in credential.stdout.splitlines() if '=' in line)
        token = values.get('password')
        if not token:
            raise RuntimeError('Existing Git credential helper returned no token')
        return token

    def request(url, method='GET', data=None, authenticated=False, raw=False):
        host = urllib.parse.urlparse(url).hostname
        if authenticated and host not in ['api.github.com', 'uploads.github.com']:
            raise RuntimeError('Refusing to transmit credentials to another host')
        headers = {'User-Agent': 'WorkMemo-release', 'Accept': 'application/vnd.github+json',
                   'Cache-Control': 'no-cache', 'X-GitHub-Api-Version': '2022-11-28'}
        if authenticated:
            headers['Authorization'] = 'Bearer ' + get_token()
        if data is not None:
            headers['Content-Type'] = 'application/octet-stream' if raw else 'application/json'
            if not raw:
                data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        for attempt in range(3):
            try:
                with (private if authenticated else public).open(req, timeout=45) as response:
                    body = response.read()
                    return body if raw else json.loads(body)
            except urllib.error.HTTPError:
                raise
            except (urllib.error.URLError, TimeoutError):
                if method != 'GET' or attempt == 2:
                    raise
                print('Retrying metadata GET after a network error', flush=True)
                time.sleep(attempt + 1)

    def api(path, method='GET', data=None, authenticated=False):
        try:
            return request(API + '/' + path, method, data, authenticated)
        except urllib.error.HTTPError as error:
            if method == 'GET' and not authenticated and error.code == 403 and error.headers.get('X-RateLimit-Remaining') == '0':
                return request(API + '/' + path, method, data, True)
            raise

    def save(name, value):
        (output / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    def summary(release):
        return {key: release.get(key) for key in ['id', 'tag_name', 'html_url', 'draft', 'prerelease', 'published_at']}

    def find_release(authenticated=False):
        try:
            return api('releases/tags/' + tag, authenticated=authenticated)
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
        if authenticated:
            return next((r for r in api('releases?per_page=100', authenticated=True) if r['tag_name'] == tag), None)
        return None

    def old_summary():
        release = api('releases/tags/' + args.previous)
        return {'id': release['id'], 'tag_name': release['tag_name'],
                'assets': [{key: a.get(key) for key in ['id', 'name', 'size', 'digest']} for a in release['assets']],
                'ref': api('git/ref/tags/' + args.previous)['object']}

    if args.step == 'inspect':
        old = old_summary()
        checkpoint = output / 'previous-release.json'
        if checkpoint.exists() and json.loads(checkpoint.read_text(encoding='utf-8')) != old:
            raise RuntimeError('Previous release changed since the recorded inspection')
        save('previous-release.json', old)
        existing = find_release()
        print(json.dumps({'latest': api('releases/latest')['tag_name'], 'previous_assets': old['assets'],
                          'existing_new_release': summary(existing) if existing else None}, ensure_ascii=False))
        return

    names = [f'WorkMemo_{version}_x64-setup.exe', f'WorkMemo_{version}_windows_x64.zip',
             'THIRD-PARTY-LICENSES.txt', 'SHA256SUMS.txt']
    files = {name: (output / name).read_bytes() for name in names}
    hashes = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    lines = files['SHA256SUMS.txt'].decode('utf-8-sig').splitlines()
    if len(lines) != 3:
        raise RuntimeError('Unexpected checksum manifest')
    for line in lines:
        digest, name = line.split('  ', 1)
        if name not in names[:3] or hashes[name] != digest:
            raise RuntimeError('Local asset checksum mismatch')

    def check_assets(release):
        assets = {a['name']: a for a in release['assets']}
        if set(assets) != set(names):
            raise RuntimeError('Release does not have exactly the expected four assets')
        for name, asset in assets.items():
            if asset['size'] != len(files[name]) or asset.get('digest') != 'sha256:' + hashes[name] or asset['state'] != 'uploaded':
                raise RuntimeError('Server asset differs from verified local file: ' + name)

    if args.step in ['prepare', 'publish']:
        ref = api('git/ref/tags/' + tag, authenticated=True)['object']
        if ref['type'] == 'tag':
            ref = api('git/tags/' + ref['sha'], authenticated=True)['object']
        if ref['type'] != 'commit' or ref['sha'] != args.commit:
            raise RuntimeError('New tag does not match the verified build commit')
        marker = 'Build source: ' + args.commit
        release = find_release(True)
        if release and marker not in (release.get('body') or ''):
            raise RuntimeError('Existing release belongs to a different build; refusing to modify it')
        if args.step == 'prepare':
            if not args.notes:
                raise RuntimeError('Supply the reviewed UTF-8 release notes')
            body = args.notes.read_text(encoding='utf-8') + '\n\n' + marker
            if release is None:
                release = api('releases', 'POST', {'tag_name': tag, 'target_commitish': args.commit,
                              'name': 'WorkMemo ' + tag, 'body': body, 'draft': True,
                              'prerelease': False, 'make_latest': 'false'}, True)
            if not release['draft']:
                raise RuntimeError('Release is already public; use verify instead')
            assets = {a['name']: a for a in release['assets']}
            upload = release['upload_url'].split('{', 1)[0]
            if not upload.startswith(f'https://uploads.github.com/repos/{REPO}/releases/{release["id"]}/assets'):
                raise RuntimeError('Unexpected upload destination')
            for name in names:
                if name in assets:
                    a = assets[name]
                    if a['size'] != len(files[name]) or a.get('digest') != 'sha256:' + hashes[name]:
                        raise RuntimeError('Existing draft asset differs; no automatic deletion: ' + name)
                else:
                    request(upload + '?' + urllib.parse.urlencode({'name': name}), 'POST', files[name], True, True)
                    print('Uploaded ' + name, flush=True)
            release = api('releases/' + str(release['id']), authenticated=True)
            check_assets(release)
            save('prepared-release.json', summary(release))
            print(json.dumps(summary(release)))
            return
        if release is None:
            raise RuntimeError('No prepared release exists')
        check_assets(release)
        if release['draft']:
            release = api('releases/' + str(release['id']), 'PATCH',
                          {'draft': False, 'prerelease': False, 'make_latest': 'true'}, True)
        save('published-release.json', summary(release))
        print(json.dumps(summary(release)))
        return

    release = find_release()
    if release is None or release['draft'] or release['prerelease']:
        raise RuntimeError('Stable public release not found')
    check_assets(release)
    latest = api('releases/latest')['tag_name']
    if latest != tag:
        raise RuntimeError('New release is not public Latest')
    previous = json.loads((output / 'previous-release.json').read_text(encoding='utf-8'))
    if old_summary() != previous:
        raise RuntimeError('Previous release assets/tag changed')
    with public.open(urllib.request.Request(release['html_url'], headers={'User-Agent': 'WorkMemo-public-verification'}), timeout=90) as response:
        if response.status != 200 or response.geturl() != release['html_url']:
            raise RuntimeError('Release page is not anonymously accessible')
        response.read()
    downloads = output / 'public-verified'
    downloads.mkdir(exist_ok=True)
    receipt = {**summary(release), 'latest': latest, 'previous_release_preserved': True, 'assets': []}
    for asset in release['assets']:
        name = asset['name']
        url = asset['browser_download_url']
        if not url.startswith(f'https://github.com/{REPO}/releases/download/{tag}/'):
            raise RuntimeError('Unexpected public download URL')
        req = urllib.request.Request(url, headers={'User-Agent': 'WorkMemo-public-verification'})
        with public.open(req, timeout=90) as response:
            downloaded = response.read()
        if len(downloaded) != len(files[name]) or hashlib.sha256(downloaded).hexdigest() != hashes[name]:
            raise RuntimeError('Anonymous download differs from local asset: ' + name)
        (downloads / name).write_bytes(downloaded)
        receipt['assets'].append({'name': name, 'bytes': len(downloaded), 'sha256': hashes[name],
                                  'public_verified': True, 'url': url})
        print('Anonymous SHA256 verified: ' + name, flush=True)
    save('public-receipt.json', receipt)
    print(json.dumps(receipt, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        print('GitHub HTTP error: ' + str(error.code), file=sys.stderr)
        sys.exit(1)
    except (urllib.error.URLError, TimeoutError) as error:
        reason = getattr(error, 'reason', error)
        print('GitHub network request failed (' + type(reason).__name__ + '); no credentials were logged', file=sys.stderr)
        sys.exit(1)
    except (RuntimeError, ValueError, OSError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
