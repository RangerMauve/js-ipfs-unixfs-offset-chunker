// @ts-ignore
import BufferList from 'bl/BufferList.js'

// TODO: Add ts types
export async function * offsetChunker (source, { offsets }) {
  let currentOffset = 0
  let offsetIndex = 0
  let expectedOffset = offsets[offsetIndex]
  let expectedSize = expectedOffset
  let grabRest = false

  const list = new BufferList()

  function pullOffset () {
    offsetIndex++
    if (offsetIndex >= offsets.length) {
      grabRest = true
      return false
    }
    const lastOffset = expectedOffset
    expectedOffset = offsets[offsetIndex]
    expectedSize = expectedOffset - lastOffset
    return true
  }

  for await (const chunk of source) {
    list.append(chunk)
    currentOffset += chunk.length

    // If we did all our offsets, just grab the rest of the data
    if (grabRest) continue

    // While we have more data than the expected offset wants
    while (currentOffset >= expectedOffset) {
      // yield the next chunk
      yield list.slice(0, expectedSize)

      // Remove that chunk from the buffer list
      list.consume(expectedSize)

      // Pull the next offset if one exists
      if (!pullOffset()) {
        // If there are no more offsets, we should grab the rest in a chunk
        break
      }
    }
  }

  yield list.slice()
}
