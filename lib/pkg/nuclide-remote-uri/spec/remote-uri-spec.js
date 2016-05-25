'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const nuclideUri = require('..');
import path from 'path';

describe('nuclide-uri', () => {
  const localUri = '/usr/local/file';
  const badRemoteUriNoPort = 'nuclide://fb.com/un/deux';
  const badRemoteUriNoPath = 'nuclide://fb.com:8000';
  const remoteUri = nuclideUri.createRemoteUri('fb.com', 8000, '/usr/local');
  const remoteUriWithSpaces = nuclideUri.createRemoteUri('fb.com', 8000, '/a b/c d');
  const remoteUriWithHashes = nuclideUri.createRemoteUri('fb.co.uk', 8000, '/ab/#c.d  #');

  it('isRemote', () => {
    expect(nuclideUri.isRemote('/')).toBe(false);
    expect(nuclideUri.isRemote(remoteUri)).toBe(true);
  });

  it('isLocal', () => {
    expect(nuclideUri.isLocal('/')).toBe(true);
    expect(nuclideUri.isLocal(remoteUri)).toBe(false);
  });

  it('createRemoteUri', () => {
    expect(remoteUri).toBe('nuclide://fb.com:8000/usr/local');
    expect(remoteUriWithSpaces).toBe('nuclide://fb.com:8000/a b/c d');
  });

  it('join', () => {
    expect(nuclideUri.join.bind(null, badRemoteUriNoPath, '../foo')).toThrow();
    expect(nuclideUri.join('/usr/local', 'bin')).toBe('/usr/local/bin');
    expect(nuclideUri.join(remoteUri, 'bin')).toBe('nuclide://fb.com:8000/usr/local/bin');
    expect(nuclideUri.join('/usr/local', '..')).toBe('/usr');
    expect(nuclideUri.join(remoteUri, '..')).toBe('nuclide://fb.com:8000/usr');
  });

  describe('parsing remote', () => {
    it('handles simple paths', () => {
      expect(nuclideUri.getHostname(remoteUri)).toBe('fb.com');
      expect(nuclideUri.getPort(remoteUri)).toBe(8000);
      expect(nuclideUri.getPath(remoteUri)).toBe('/usr/local');
    });

    it('does not encode space characters', () => {
      expect(nuclideUri.getHostname(remoteUriWithSpaces)).toBe('fb.com');
      expect(nuclideUri.getPort(remoteUriWithSpaces)).toBe(8000);
      expect(nuclideUri.getPath(remoteUriWithSpaces)).toBe('/a b/c d');
    });

    it('treats hash symbols as literals, part of the path', () => {
      const parsedUri = nuclideUri.parse(remoteUriWithHashes);
      expect(parsedUri.hostname).toBe('fb.co.uk');
      expect(parsedUri.port).toBe('8000');
      expect(parsedUri.pathname).toBe('/ab/#c.d  #');
    });
  });

  it('parsing local', () => {
    expect(() => nuclideUri.getHostname(localUri)).toThrow();
    expect(() => nuclideUri.getPort(localUri)).toThrow();
    expect(nuclideUri.getPath(localUri)).toBe(localUri);
    expect(() => nuclideUri.parseRemoteUri(localUri)).toThrow();
  });

  it('basename', () => {
    expect(nuclideUri.basename(localUri)).toBe('file');
    expect(nuclideUri.basename(remoteUri)).toBe('local');
  });

  it('dirname', () => {
    expect(nuclideUri.dirname(localUri)).toBe('/usr/local');
    expect(nuclideUri.dirname(remoteUri)).toBe('nuclide://fb.com:8000/usr');
    expect(nuclideUri.dirname.bind(null, badRemoteUriNoPort)).toThrow();
    expect(nuclideUri.dirname(remoteUriWithSpaces)).toBe('nuclide://fb.com:8000/a b');
  });

  it('getParent', () => {
    expect(nuclideUri.getParent(localUri)).toBe('/usr/local');
    expect(nuclideUri.getParent(remoteUri)).toBe('nuclide://fb.com:8000/usr');
  });

  it('contains', () => {
    expect(nuclideUri.contains('/usr/local', localUri)).toBe(true);
    expect(nuclideUri.contains('nuclide://fb.com:8000/usr', remoteUri)).toBe(true);
  });

  it('normalize', () => {
    expect(nuclideUri.normalize(localUri)).toBe(localUri);
    expect(nuclideUri.normalize(remoteUri)).toBe(remoteUri);
    expect(nuclideUri.normalize.bind(null, badRemoteUriNoPath)).toThrow();
    expect(nuclideUri.normalize('/usr/local/..')).toBe('/usr');
    expect(nuclideUri.normalize('nuclide://fb.com:8000/usr/local/..')).toBe('nuclide://fb.com:8000/usr');
    expect(nuclideUri.normalize('/a b/c d/..')).toBe('/a b');
  });

  it('relative', () => {
    expect(() => nuclideUri.relative(localUri, remoteUri)).toThrow();
    expect(nuclideUri.relative(nuclideUri.dirname(remoteUri), remoteUri)).toBe('local');
    expect(nuclideUri.relative(remoteUri, nuclideUri.dirname(remoteUri))).toBe('..');
    expect(nuclideUri.relative(nuclideUri.dirname(remoteUriWithSpaces), remoteUriWithSpaces))
      .toBe('c d');
    expect(nuclideUri.relative(remoteUriWithSpaces, nuclideUri.dirname(remoteUriWithSpaces)))
      .toBe('..');
    expect(nuclideUri.relative(nuclideUri.dirname(localUri), localUri)).toBe('file');
    expect(nuclideUri.relative(localUri, nuclideUri.dirname(localUri))).toBe('..');
  });

  it('nuclideUriToDisplayString', () => {
    expect(nuclideUri.nuclideUriToDisplayString(localUri)).toBe(localUri);
    expect(nuclideUri.nuclideUriToDisplayString(remoteUri)).toBe('fb.com//usr/local');
  });

  it('detects Windows and Posix paths properly', () => {
    const win32Path = path.win32;
    const posixPath = path.posix;

    expect(nuclideUri.pathModuleFor('/')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('/abc')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('/abc/def')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('/abc.txt')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('nuclide://host')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('nuclide://host:123/')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('nuclide://host:123/abc')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('nuclide://host:123/abc/def')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('nuclide://host:123/abc/def.txt')).toBe(posixPath);
    expect(nuclideUri.pathModuleFor('C:\\')).toBe(win32Path);
    expect(nuclideUri.pathModuleFor('C:\\abc')).toBe(win32Path);
    expect(nuclideUri.pathModuleFor('C:\\abc\\def')).toBe(win32Path);
    expect(nuclideUri.pathModuleFor('C:\\abc\\def.txt')).toBe(win32Path);
    expect(nuclideUri.pathModuleFor('D:\\abc\\aaa bbb')).toBe(win32Path);
    expect(nuclideUri.pathModuleFor('\\abc\\def')).toBe(win32Path);
  });
});
