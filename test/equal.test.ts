import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
// eslint-disable-next-line node/no-extraneous-import
import { v4 as uuidv4 } from 'uuid'

import { isFileEqualBuffer } from '../src/index'

function deleteFile(filePath: string): Promise<void> {
  return new Promise(function executor(resolve, reject) {
    fs.unlink(filePath, function callback(err) {
      if (err !== null && err.code !== 'ENOENT') {
        return reject(err)
      }

      resolve()
    })
  })
}

function writeToFile(filePath: string, length: number): Promise<Buffer> {
  return new Promise(function executor(resolve, reject) {
    const data = crypto.randomBytes(length)

    fs.writeFile(filePath, data, function callback(err) {
      err ? reject(err) : resolve(data)
    })
  })
}

const files: Set<string> = new Set()

function tempFileName(register = true): string {
  const name = path.join(os.tmpdir(), uuidv4())

  if (register) {
    files.add(name)
  }

  return name
}

describe('isFileEqualBuffer', () => {
  afterAll(() => {
    return Promise.all(
      [...files.values()].map(function mapper(filePath) {
        return deleteFile(filePath)
      })
    )
  })

  test('test with file not exists', async () => {
    const filePath = tempFileName(false)

    // Filled buffer

    let buffer = Buffer.from('any data')

    let isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()

    // Empty buffer

    buffer = Buffer.alloc(0)

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()
  })

  test('test with empty file', async () => {
    const filePath = tempFileName()

    // Empty buffer

    let buffer = await writeToFile(filePath, 0)

    let isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeTruthy()

    // Filled buffer

    buffer = Buffer.from('any data')

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()
  })

  // For testing files with different sizes
  async function testFileWithSize(
    filePath: string,
    length: number
  ): Promise<void> {
    const origin = await writeToFile(filePath, length)

    let isEqual = await isFileEqualBuffer(filePath, origin)

    expect(isEqual).toBeTruthy()

    // Same same buffer with a change at the beginning

    let buffer = Buffer.from(origin)

    let byte = buffer[0]

    buffer[0] ^= byte

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()

    // Same size buffer with a change at the end

    buffer = Buffer.from(origin)

    byte = buffer[buffer.length - 1]

    buffer[buffer.length - 1] ^= byte

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()

    // Different same size buffer

    buffer = Buffer.from(origin)

    for (let i = 0; i < buffer.length; ++i) {
      buffer[i] ^= buffer[i]
    }

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()

    // Smaller buffer size

    buffer = origin.slice(0, origin.length - 1)

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()

    // Larger buffer size

    buffer = Buffer.concat([origin, origin])

    isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()
  }

  test('test with small file (up to 4 Kb)', async () => {
    const filePath = tempFileName()

    await testFileWithSize(filePath, 1 << 11) // 2048 bytes

    // Empty buffer
    const buffer = Buffer.alloc(0)

    const isEqual = await isFileEqualBuffer(filePath, buffer)

    expect(isEqual).toBeFalsy()
  })

  test('test with large file (~16Mb)', async () => {
    const filePath = tempFileName()

    await testFileWithSize(filePath, 1 << 24) // ~16Mb
  })
})
