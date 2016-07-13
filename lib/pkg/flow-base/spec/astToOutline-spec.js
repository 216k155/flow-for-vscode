'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowOutlineTree} from '..';

import {astToOutline} from '../lib/astToOutline';

import classAST from './fixtures/class-ast';
import jasmineAST from './fixtures/jasmine-ast';
import toplevelAST from './fixtures/toplevel-ast';
import exportsAST from './fixtures/exports-ast';
import typesAST from './fixtures/types-ast';

const expectedClassOutline = [
  {
    tokenizedText: [
      {value: 'export', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'class', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'Foo', kind: 'class-name'},
    ],
    representativeName: 'Foo',
    startPosition: {
      line: 11,
      column: 0,
    },
    endPosition: {
      line: 19,
      column: 1,
    },
    children: [
      {
        tokenizedText: [
          {value: 'field', kind: 'method'},
          {value: '=', kind: 'plain'},
        ],
        representativeName: 'field',
        startPosition: {
          line: 12,
          column: 2,
        },
        endPosition: {
          line: 12,
          column: 14,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'bar', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'bar',
        startPosition: {
          line: 14,
          column: 2,
        },
        endPosition: {
          line: 16,
          column: 3,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'baz', kind: 'method'},
          {value: '=', kind: 'plain'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'baz',
        startPosition: {
          line: 18,
          column: 2,
        },
        endPosition: {
          line: 18,
          column: 35,
        },
        children: [],
      },
    ],
  },
];

const expectedToplevelOutline = [
  {
    tokenizedText: [
      {value: 'function', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'baz', kind: 'method'},
      {value: '(', kind: 'plain'},
      {value: 'arg', kind: 'param'},
      {value: ',', kind: 'plain'},
      {value: ' ', kind: 'whitespace'},
      {value: 'a', kind: 'param'},
      {value: ')', kind: 'plain'},
    ],
    representativeName: 'baz',
    startPosition: {
      line: 11,
      column: 0,
    },
    endPosition: {
      line: 14,
      column: 1,
    },
    children: [],
  },
  {
    tokenizedText: [
      {value: 'function', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'foo', kind: 'method'},
      {value: '(', kind: 'plain'},
      {value: '{', kind: 'plain'},
      {value: 'bar', kind: 'param'},
      {value: ',', kind: 'plain'},
      {value: ' ', kind: 'whitespace'},
      {value: 'y', kind: 'param'},
      {value: '}', kind: 'plain'},
      {value: ',', kind: 'plain'},
      {value: ' ', kind: 'whitespace'},
      {value: '[', kind: 'plain'},
      {value: 'b', kind: 'param'},
      {value: ']', kind: 'plain'},
      {value: ')', kind: 'plain'},
    ],
    representativeName: 'foo',
    startPosition: {
      line: 16,
      column: 0,
    },
    endPosition: {
      line: 18,
      column: 1,
    },
    children: [],
  },
];

const expectedJasmineOutline = [
  {
    tokenizedText: [
      {value: 'describe', kind: 'method'},
      {value: ' ', kind: 'whitespace'},
      {value: 'foo', kind: 'string'},
    ],
    representativeName: 'foo',
    startPosition: {
      line: 11,
      column: 0,
    },
    endPosition: {
      line: 16,
      column: 3,
    },
    children: [
      {
        tokenizedText: [
          {value: 'it', kind: 'method'},
          {value: ' ', kind: 'whitespace'},
          {value: 'should work', kind: 'string'},
        ],
        representativeName: 'should work',
        startPosition: {
          line: 13,
          column: 2,
        },
        endPosition: {
          line: 15,
          column: 5,
        },
        children: [],
      },
    ],
  },
  {
    tokenizedText: [
      {value: 'describe', kind: 'method'},
      {value: ' ', kind: 'whitespace'},
      {value: 'bar', kind: 'string'},
    ],
    representativeName: 'bar',
    startPosition: {
      line: 18,
      column: 0,
    },
    endPosition: {
      line: 21,
      column: 3,
    },
    children: [
      {
        tokenizedText: [
          {value: 'it', kind: 'method'},
          {value: ' ', kind: 'whitespace'},
          {value: 'should work with a normal function', kind: 'string'},
        ],
        representativeName: 'should work with a normal function',
        startPosition: {
          line: 19,
          column: 2,
        },
        endPosition: {
          line: 20,
          column: 5,
        },
        children: [],
      },
    ],
  },
];

const expectedExportsOutline: Array<FlowOutlineTree> = [
  {
    tokenizedText: [
      {value: 'module.exports', kind: 'plain'},
    ],
    startPosition: {
      line: 13,
      column: 0,
    },
    endPosition: {
      line: 24,
      column: 1,
    },
    children: [
      {
        tokenizedText: [
          {value: 'foo', kind: 'string'},
          {value: ':', kind: 'plain'},
        ],
        representativeName: 'foo',
        startPosition: {
          line: 14,
          column: 2,
        },
        endPosition: {
          line: 14,
          column: 8,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'bar', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'bar',
        startPosition: {
          line: 15,
          column: 2,
        },
        endPosition: {
          line: 17,
          column: 3,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'baz', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'baz',
        startPosition: {
          line: 18,
          column: 2,
        },
        endPosition: {
          line: 18,
          column: 33,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'asdf', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'asdf',
        startPosition: {
          line: 19,
          column: 2,
        },
        endPosition: {
          line: 19,
          column: 24,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'jkl', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'jkl',
        startPosition: {
          line: 20,
          column: 2,
        },
        endPosition: {
          line: 20,
          column: 27,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'asdfjkl', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        representativeName: 'asdfjkl',
        startPosition: {
          line: 21,
          column: 2,
        },
        endPosition: {
          line: 21,
          column: 17,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'thing', kind: 'string'},
        ],
        representativeName: 'thing',
        startPosition: {
          line: 22,
          column: 2,
        },
        endPosition: {
          line: 22,
          column: 7,
        },
        children: [],
      },
      {
        tokenizedText: [
          {value: 'stuff', kind: 'string'},
          {value: ':', kind: 'plain'},
        ],
        representativeName: 'stuff',
        startPosition: {
          line: 23,
          column: 2,
        },
        endPosition: {
          line: 23,
          column: 14,
        },
        children: [],
      },
    ],
  },
];

const expectedTypesOutline = [
  {
    tokenizedText: [
      {value: 'type', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'Foo', kind: 'type'},
    ],
    representativeName: 'Foo',
    startPosition: {
      line: 13,
      column: 0,
    },
    endPosition: {
      line: 13,
      column: 18,
    },
    children: [],
  },
  {
    tokenizedText: [
      {value: 'export', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'type', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'Bar', kind: 'type'},
    ],
    representativeName: 'Bar',
    startPosition: {
      line: 14,
      column: 0,
    },
    endPosition: {
      line: 14,
      column: 30,
    },
    children: [],
  },
];

describe('astToOutline', () => {
  it('should provide a class outline', () => {
    expect(astToOutline(classAST)).toEqual(expectedClassOutline);
  });

  it('should provide an outline for miscellaneous top-level statements', () => {
    expect(astToOutline(toplevelAST)).toEqual(expectedToplevelOutline);
  });

  it('should provide an outline for Jasmine specs', () => {
    expect(astToOutline(jasmineAST)).toEqual(expectedJasmineOutline);
  });

  it('should provide an outline for module.exports', () => {
    expect(astToOutline(exportsAST)).toEqual(expectedExportsOutline);
  });

  it('should provide an outline for type declarations', () => {
    expect(astToOutline(typesAST)).toEqual(expectedTypesOutline);
  });
});
