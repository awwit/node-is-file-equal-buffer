import { PathLike } from 'fs'

type FsType = typeof import('fs')
type PartialFsType = Pick<FsType, 'stat' | 'createReadStream'>

function getFileSize(filePath: PathLike, fs: PartialFsType): Promise<number> {
  return new Promise(function executor(resolve, reject) {
    fs.stat(filePath, function stat(err, stats) {
      if (err !== null) {
        if (err.code === 'ENOENT') {
          return resolve(-1)
        }

        return reject(err)
      }

      resolve(stats.size)
    })
  })
}

interface FileEqualBufferOptions {
  fs?: PartialFsType
}

export function isFileEqualBuffer(
  filePath: PathLike,
  buffer: Buffer,
  { fs = require('fs') }: FileEqualBufferOptions = {}
): Promise<boolean> {
  return getFileSize(filePath, fs).then(function fileSize(size) {
    if (buffer.length !== size) {
      return false
    }

    return new Promise(function executor(resolve, reject) {
      const stream = fs.createReadStream(filePath)

      let offset = 0
      let isEqual = true

      stream.on('data', function read(data: Buffer | string) {
        if (!Buffer.isBuffer(data)) {
          data = Buffer.from(data)
        }

        if (
          buffer.length >= offset + data.length &&
          buffer.compare(data, 0, data.length, offset, offset + data.length) ===
            0
        ) {
          offset += data.length
        } else {
          isEqual = false
          stream.close()
        }
      })

      stream.on('error', function error(err: NodeJS.ErrnoException) {
        if (err.code === 'ENOENT') {
          isEqual = false
          resolve(isEqual)
        } else {
          reject(err)
        }
      })

      stream.on('close', function close() {
        resolve(offset === 0 && buffer.length > 0 ? false : isEqual)
      })
    })
  })
}

export default isFileEqualBuffer
