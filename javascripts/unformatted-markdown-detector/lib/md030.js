/**
 The MIT License (MIT)

Copyright (c) 2015-2021 David Anson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

//This file is copied from Markdownlint JS lib and modified to run on Ember platform.
//Github URL: https://github.com/DavidAnson/markdownlint/blob/main/lib/md030.js

import helpers from "../helpers/helpers";
import cache from "./cache";

export default {
  "names": ["MD030", "list-marker-space"],
  "description": "Spaces after list markers",
  "tags": ["ol", "ul", "whitespace"],
  "function": function MD030(params, onError) {
    const ulSingle = Number(params.config.ul_single || 1);
    const olSingle = Number(params.config.ol_single || 1);
    const ulMulti = Number(params.config.ul_multi || 1);
    const olMulti = Number(params.config.ol_multi || 1);
    cache.flattenedLists().forEach((list) => {
      const lineCount = list.lastLineIndex - list.open.map[0];
      const allSingle = lineCount === list.items.length;
      const expectedSpaces = list.unordered ?
        (allSingle ? ulSingle : ulMulti) :
        (allSingle ? olSingle : olMulti);
      list.items.forEach((item) => {
        const { line, lineNumber } = item;
        const match = /^[\s>]*\S+(\s*)/.exec(line);
        const [{ "length": matchLength }, { "length": actualSpaces }] = match;
        if (matchLength < line.length) {
          let fixInfo = null;
          if (expectedSpaces !== actualSpaces) {
            fixInfo = {
              "editColumn": matchLength - actualSpaces + 1,
              "deleteCount": actualSpaces,
              "insertText": "".padEnd(expectedSpaces)
            };
          }
          helpers.addErrorDetailIf(
            onError,
            lineNumber,
            expectedSpaces,
            actualSpaces,
            null,
            null,
            [1, matchLength],
            fixInfo
          );
        }
      });
    });
  }
};
