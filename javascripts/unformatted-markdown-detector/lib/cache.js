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
//Github URL: https://github.com/DavidAnson/markdownlint/blob/main/lib/cache.js

let cache = {};

let flattenedLists = null;
cache.flattenedLists = (value) => {
  if (value) {
    flattenedLists = value;
  }
  return flattenedLists;
};

let inlineCodeSpanRanges = null;
cache.inlineCodeSpanRanges = (value) => {
  if (value) {
    inlineCodeSpanRanges = value;
  }
  return inlineCodeSpanRanges;
};

let lineMetadata = null;
cache.lineMetadata = (value) => {
  if (value) {
    lineMetadata = value;
  }
  return lineMetadata;
};

cache.clear = () => {
  flattenedLists = null;
  inlineCodeSpanRanges = null;
  lineMetadata = null;
};

export default cache;