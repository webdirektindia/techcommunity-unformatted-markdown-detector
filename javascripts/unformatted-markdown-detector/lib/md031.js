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
//Github URL: https://github.com/DavidAnson/markdownlint/blob/main/lib/md031.js

import helpers from "../helpers/helpers";
import cache from "./cache";

const codeFencePrefixRe = /^(.*?)\s*[`~]/;

export default {
  "names": ["MD031", "blanks-around-fences"],
  "description": "Fenced code blocks should be surrounded by blank lines",
  "tags": ["code", "blank_lines"],
  "function": function MD031(params, onError) {
    const listItems = params.config.list_items;
    const includeListItems = (listItems === undefined) ? true : !!listItems;
    const { lines } = params;
    helpers.forEachLine(cache.lineMetadata(), (line, i, inCode, onFence, inTable, inItem) => {
      const onTopFence = (onFence > 0);
      const onBottomFence = (onFence < 0);
      if ((includeListItems || !inItem) &&
        ((onTopFence && !helpers.isBlankLine(lines[i - 1])) ||
          (onBottomFence && !helpers.isBlankLine(lines[i + 1])))) {
        const [, prefix] = line.match(codeFencePrefixRe) || [];
        const fixInfo = (prefix === undefined) ? null : {
          "lineNumber": i + (onTopFence ? 1 : 2),
          "insertText": `${prefix}\n`
        };
        helpers.addErrorContext(
          onError,
          i + 1,
          lines[i].trim(),
          null,
          null,
          null,
          fixInfo);
      }
    });
  }
};
