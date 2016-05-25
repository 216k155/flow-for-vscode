'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const {asyncExecute, fsPromise} = require('../../nuclide-commons/lib/main');
const LRU = require('lru-cache');

import invariant from 'assert';

const flowConfigDirCache = LRU({
  max: 10,
  length: function(n) { return n.length; },
  maxAge: 1000 * 30, //30 seconds
});
const flowPathCache = LRU({
  max: 10,
  maxAge: 1000 * 30, // 30 seconds
});

function insertAutocompleteToken(contents: string, line: number, col: number): string {
  const lines = contents.split('\n');
  let theLine = lines[line];
  theLine = theLine.substring(0, col) + 'AUTO332' + theLine.substring(col);
  lines[line] = theLine;
  return lines.join('\n');
}

/**
 * Takes an autocomplete item from Flow and returns a valid autocomplete-plus
 * response, as documented here:
 * https://github.com/atom/autocomplete-plus/wiki/Provider-API
 */
function processAutocompleteItem(replacementPrefix: string, flowItem: Object): Object {
  // Truncate long types for readability
  const description = flowItem['type'].length < 80
    ? flowItem['type']
    : flowItem['type'].substring(0,80) + ' ...';
  let result = {
    description: description,
    displayText: flowItem['name'],
    replacementPrefix,
  };
  const funcDetails = flowItem['func_details'];
  if (funcDetails) {
    // The parameters in human-readable form for use on the right label.
    const rightParamStrings = funcDetails['params']
      .map(param => `${param['name']}: ${param['type']}`);
    const snippetString = getSnippetString(funcDetails['params'].map(param => param['name']));
    result = {
      ...result,
      leftLabel: funcDetails['return_type'],
      rightLabel: `(${rightParamStrings.join(', ')})`,
      snippet: `${flowItem['name']}(${snippetString})`,
      type: 'function',
    };
  } else {
    result = {
      ...result,
      rightLabel: flowItem['type'],
      text: flowItem['name'],
    };
  }
  return result;
}

function getSnippetString(paramNames: Array<string>): string {
  const groupedParams = groupParamNames(paramNames);
  // The parameters turned into snippet strings.
  const snippetParamStrings = groupedParams
    .map(params => params.join(', '))
    .map((param, i) => `\${${i + 1}:${param}}`);
  return snippetParamStrings.join(', ');
}

/**
 * Group the parameter names so that all of the trailing optional parameters are together with the
 * last non-optional parameter. That makes it easy to ignore the optional parameters, since they
 * will be selected along with the last non-optional parameter and you can just type to overwrite
 * them.
 */
function groupParamNames(paramNames: Array<string>): Array<Array<string>> {
  // Split the parameters into two groups -- all of the trailing optional paramaters, and the rest
  // of the parameters. Trailing optional means all optional parameters that have only optional
  // parameters after them.
  const [ordinaryParams, trailingOptional] =
    paramNames.reduceRight(([ordinary, optional], param) => {
      // If there have only been optional params so far, and this one is optional, add it to the
      // list of trailing optional params.
      if (isOptional(param) && ordinary.length === 0) {
        optional.unshift(param);
      } else {
        ordinary.unshift(param);
      }
      return [ordinary, optional];
    },
    [[], []]
  );

  const groupedParams = ordinaryParams.map(param => [param]);
  const lastParam = groupedParams[groupedParams.length - 1];
  if (lastParam != null) {
    lastParam.push(...trailingOptional);
  } else if (trailingOptional.length > 0) {
    groupedParams.push(trailingOptional);
  }

  return groupedParams;
}

function isOptional(param: string): boolean {
  invariant(param.length > 0);
  const lastChar = param[param.length - 1];
  return lastChar === '?';
}

async function isFlowInstalled(): Promise<boolean> {
  const flowPath = getPathToFlow();
  if (!flowPathCache.has(flowPath)) {
    flowPathCache.set(flowPath, await canFindFlow(flowPath));
  }

  return flowPathCache.get(flowPath);
}

async function canFindFlow(flowPath: string): Promise<boolean> {
  try {
    await asyncExecute('which', [flowPath]);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @return The path to Flow on the user's machine. It is recommended not to cache the result of this
 *   function in case the user updates his or her preferences in Atom, in which case the return
 *   value will be stale.
 */
function getPathToFlow(): string {
  if (global.vscode) {
    return global.vscode.workspace.getConfiguration('flow').get('pathToFlow') || 'flow'
  }
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  return global.atom && global.atom.config.get('nuclide.nuclide-flow.pathToFlow') || 'flow';
}

function getStopFlowOnExit(): boolean {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return ((global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit'): any): boolean);
  }
  return true;
}

function findFlowConfigDir(localFile: string): Promise<?string> {
  if (!flowConfigDirCache.has(localFile)) {
    const flowConfigDir = fsPromise.findNearestFile('.flowconfig', path.dirname(localFile));
    flowConfigDirCache.set(localFile, flowConfigDir);
  }
  return flowConfigDirCache.get(localFile);
}

module.exports = {
  findFlowConfigDir,
  getPathToFlow,
  getStopFlowOnExit,
  insertAutocompleteToken,
  isFlowInstalled,
  processAutocompleteItem,
  groupParamNames,
};
