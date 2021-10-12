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
//Github URL: https://github.com/DavidAnson/markdownlint/blob/main/lib/md037.js

import helpers from "../helpers/helpers";
import cache from "./cache";

const emphasisRe = /(^|[^\\]|\\\\)(?:(\*\*?\*?)|(__?_?))/g;
const asteriskListItemMarkerRe = /^([\s>]*)\*(\s+)/;
const leftSpaceRe = /^\s+/;
const rightSpaceRe = /\s+$/;
const tablePipeRe = /\|/;

export default {
  "names": ["MD037", "no-space-in-emphasis"],
  "description": "Spaces inside emphasis markers",
  "tags": ["whitespace", "emphasis"],
  "function": function MD037(params, onError) {
    // eslint-disable-next-line init-declarations
    let effectiveEmphasisLength, emphasisIndex, emphasisKind, emphasisLength,
      pendingError = null;
    // eslint-disable-next-line jsdoc/require-jsdoc
    function resetRunTracking() {
      emphasisIndex = -1;
      emphasisLength = 0;
      emphasisKind = "";
      effectiveEmphasisLength = 0;
      pendingError = null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    function handleRunEnd(
      line, lineIndex, contextLength, match, matchIndex, inTable
    ) {
      // Close current run
      let content = line.substring(emphasisIndex, matchIndex);
      if (!emphasisLength) {
        content = content.trimStart();
      }
      if (!match) {
        content = content.trimEnd();
      }
      const leftSpace = leftSpaceRe.test(content);
      const rightSpace = rightSpaceRe.test(content);
      if (
        (leftSpace || rightSpace) &&
        (!inTable || !tablePipeRe.test(content))
      ) {
        // Report the violation
        const contextStart = emphasisIndex - emphasisLength;
        const contextEnd = matchIndex + contextLength;
        const context = line.substring(contextStart, contextEnd);
        const column = contextStart + 1;
        const length = contextEnd - contextStart;
        const leftMarker = line.substring(contextStart, emphasisIndex);
        const rightMarker = match ? (match[2] || match[3]) : "";
        const fixedText = `${leftMarker}${content.trim()}${rightMarker}`;
        return [
          onError,
          lineIndex + 1,
          context,
          leftSpace,
          rightSpace,
          [column, length],
          {
            "editColumn": column,
            "deleteCount": length,
            "insertText": fixedText
          }
        ];
      }
      return null;
    }
    // Initialize
    const ignoreMarkersByLine = helpers.emphasisMarkersInContent(params);
    resetRunTracking();
    helpers.forEachLine(
      cache.lineMetadata(),
      (line, lineIndex, inCode, onFence, inTable, inItem, onBreak, inMath) => {
        const onItemStart = (inItem === 1);
        if (
          inCode ||
          onFence ||
          inTable ||
          onBreak ||
          onItemStart ||
          helpers.isBlankLine(line)
        ) {
          // Emphasis resets when leaving a block
          resetRunTracking();
        }
        if (
          inCode ||
          onFence ||
          onBreak ||
          inMath
        ) {
          // Emphasis has no meaning here
          return;
        }
        if (onItemStart) {
          // Trim overlapping '*' list item marker
          line = line.replace(asteriskListItemMarkerRe, "$1 $2");
        }
        let match = null;
        // Match all emphasis-looking runs in the line...
        while ((match = emphasisRe.exec(line))) {
          const ignoreMarkersForLine = ignoreMarkersByLine[lineIndex] || [];
          const matchIndex = match.index + match[1].length;
          if (ignoreMarkersForLine.includes(matchIndex)) {
            // Ignore emphasis markers inside code spans and links
            continue;
          }
          const matchLength = match[0].length - match[1].length;
          const matchKind = (match[2] || match[3])[0];
          if (emphasisIndex === -1) {
            // New run
            emphasisIndex = matchIndex + matchLength;
            emphasisLength = matchLength;
            emphasisKind = matchKind;
            effectiveEmphasisLength = matchLength;
          } else if (matchKind === emphasisKind) {
            // Matching emphasis markers
            if (matchLength === effectiveEmphasisLength) {
              // Ending an existing run, report any pending error
              if (pendingError) {
                // @ts-ignore
                helpers.addErrorContext(...pendingError);
                pendingError = null;
              }
              const error = handleRunEnd(
                line,
                lineIndex,
                effectiveEmphasisLength,
                match,
                matchIndex,
                inTable
              );
              if (error) {
                // @ts-ignore
                helpers.addErrorContext(...error);
              }
              // Reset
              resetRunTracking();
            } else if (matchLength === 3) {
              // Swap internal run length (1->2 or 2->1)
              effectiveEmphasisLength = matchLength - effectiveEmphasisLength;
            } else if (effectiveEmphasisLength === 3) {
              // Downgrade internal run (3->1 or 3->2)
              effectiveEmphasisLength -= matchLength;
            } else {
              // Upgrade to internal run (1->3 or 2->3)
              effectiveEmphasisLength += matchLength;
            }
            // Back up one character so RegExp has a chance to match the
            // next marker (ex: "**star**_underscore_")
            if (emphasisRe.lastIndex > 1) {
              emphasisRe.lastIndex--;
            }
          } else if (emphasisRe.lastIndex > 1) {
            // Back up one character so RegExp has a chance to match the
            // mis-matched marker (ex: "*text_*")
            emphasisRe.lastIndex--;
          }
        }
        if (emphasisIndex !== -1) {
          pendingError = pendingError ||
            handleRunEnd(line, lineIndex, 0, null, line.length, inTable);
          // Adjust for pending run on new line
          emphasisIndex = 0;
          emphasisLength = 0;
        }
      }
    );
  }
};
