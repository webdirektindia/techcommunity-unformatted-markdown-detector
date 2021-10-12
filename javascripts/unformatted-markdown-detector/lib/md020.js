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
//Github URL: https://github.com/DavidAnson/markdownlint/blob/main/lib/md020.js

import helpers from "../helpers/helpers";
import cache from "./cache";

export default {
  "names": ["MD020", "no-missing-space-closed-atx"],
  "description": "No space inside hashes on closed atx style heading",
  "tags": ["headings", "headers", "atx_closed", "spaces"],
  "function": function MD020(params, onError) {
    helpers.forEachLine(cache.lineMetadata(), (line, lineIndex, inCode) => {
      if (!inCode) {
        const match =
          /^(#+)([ \t]*)([^#]*?[^#\\])([ \t]*)((?:\\#)?)(#+)(\s*)$/.exec(line);
        if (match) {
          const [
            ,
            leftHash,
            { "length": leftSpaceLength },
            content,
            { "length": rightSpaceLength },
            rightEscape,
            rightHash,
            { "length": trailSpaceLength }
          ] = match;
          const leftHashLength = leftHash.length;
          const rightHashLength = rightHash.length;
          const left = !leftSpaceLength;
          const right = !rightSpaceLength || rightEscape;
          const rightEscapeReplacement = rightEscape ? `${rightEscape} ` : "";
          if (left || right) {
            const range = left ?
              [
                1,
                leftHashLength + 1
              ] :
              [
                line.length - trailSpaceLength - rightHashLength,
                rightHashLength + 1
              ];
            helpers.addErrorContext(
              onError,
              lineIndex + 1,
              line.trim(),
              left,
              right,
              range,
              {
                "editColumn": 1,
                "deleteCount": line.length,
                "insertText":
                  `${leftHash} ${content} ${rightEscapeReplacement}${rightHash}`
              }
            );
          }
        }
      }
    });
  }
};
