# Is File Equal Buffer

This module has the function `isFileEqualBuffer` to compare file contents and buffer.

The function runs asynchronously and returns a `Promise` with resolved `boolean`.

`isFileEqualBuffer(filePath, buffer[, options])`

- `filePath` [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) path to the file you want to compare.
- `buffer` [Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer) buffer with which to compare file contents.
- `options` [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `fs` [FileSystem](https://nodejs.org/api/fs.html) file system module (`fs`). __Default:__ `require('fs')`.
- Returns: [Promise&lt;boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) `true` if the contents of the file and buffer are equal, `false` — if not equal.

## Examples

```js
const { isFileEqualBuffer } = require('is-file-equal-buffer')

const filePath = 'path/to/file'
const buffer = Buffer.from('buffer content')

isFileEqualBuffer(filePath, buffer).then(function checkIsEqual(isEqual) {
  if (isEqual) {
    // Do something if their contents are equal
  } else {
    // Do something if their contents are NOT equal
  }
})
```

You can also provide your own modified `fs` module.

```js
const { isFileEqualBuffer } = require('is-file-equal-buffer')

const fs = require('graceful-fs') // <-- modified `fs` module

const filePath = 'path/to/file'
const buffer = Buffer.from('buffer content')

isFileEqualBuffer(filePath, buffer, { fs }).then(function checkIsEqual(isEqual) { /* ... */ })
```

## How it works (inside)

The comparison function is made in the most optimal way:

1. First, the function compares file and buffer sizes.
2. If the file does not exist, the function will return `false`.
3. If the file and buffer sizes are the same: a stream of reading data from a file is created (`fs.createReadStream`), and as new data arrives from the stream, they are compared with the buffer.
4. As soon as an inequality of the contents of the file and the buffer is detected, the read stream closes and the function returns `false`.
5. The function will return `true` only if the contents of the file and buffer completely match.

## Motivation

This can be useful not to overwrite files that do not change after processing ([and save a erase cycles for SSD as example](https://en.wikipedia.org/wiki/Wear_leveling#Rationale)).
