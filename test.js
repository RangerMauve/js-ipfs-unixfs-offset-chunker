import test from 'tape'
import { offsetChunker } from './index.js'

test('Properly chunks random stream of bytes', async (t) => {
  const source = [
    rangeBuffer(0, 1),
    rangeBuffer(2, 6),
    rangeBuffer(7, 20),
    rangeBuffer(21, 70)
  ]

  const offsets = [4, 20, 69]

  const expected = [
    rangeBuffer(0, 3),
    rangeBuffer(4, 19),
    rangeBuffer(20, 68),
    rangeBuffer(69, 70),
  ]

  const chunks = await collect(offsetChunker(source, { offsets }))

  t.deepEqual(chunks, expected, 'Got expected chunks')

  console.log({expected, chunks})
})

async function collect (iterator) {
  const items = []
  for await (const item of iterator) {
    items.push(item)
  }
  return items
}

function rangeBuffer (min, max) {
  const list = []
  while (min <= max) {
    list.push(min)
    min++
  }

  const buffer = Buffer.from(list)

  return buffer
}
