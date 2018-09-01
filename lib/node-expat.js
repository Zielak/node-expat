const expat = require('bindings')('node_expat')
const Stream = require('stream').Stream

export default class Parser extends Stream {
  constructor(encoding) {
    super()
    this.encoding = encoding
    this._getNewParser()
    this.parser.emit = this.emit.bind(this)

    // Stream API
    this.writable = true
    this.readable = true
  }

  _getNewParser() {
    this.parser = new expat.Parser(this.encoding)
  }

  parse(buf, isFinal) {
    return this.parser.parse(buf, isFinal)
  }

  setEncoding(encoding) {
    this.encoding = encoding
    return this.parser.setEncoding(this.encoding)
  }

  setUnknownEncoding(map, convert) {
    return this.parser.setUnknownEncoding(map, convert)
  }

  getError() {
    return this.parser.getError()
  }
  stop() {
    return this.parser.stop()
  }
  pause() {
    return this.stop()
  }
  resume() {
    return this.parser.resume()
  }

  destroy() {
    this.parser.stop()
    this.end()
  }

  destroySoon() {
    this.destroy()
  }

  write(data) {
    var error, result
    try {
      result = this.parse(data)
      if (!result) {
        error = this.getError()
      }
    } catch (e) {
      error = e
    }
    if (error) {
      this.emit('error', error)
      this.emit('close')
    }
    return result
  }

  end(data) {
    var error, result
    try {
      result = this.parse(data || '', true)
      if (!result) {
        error = this.getError()
      }
    } catch (e) {
      error = e
    }

    if (!error) {
      this.emit('end')
    } else {
      this.emit('error', error)
    }
    this.emit('close')
  }

  reset() {
    return this.parser.reset()
  }
  getCurrentLineNumber() {
    return this.parser.getCurrentLineNumber()
  }
  getCurrentColumnNumber() {
    return this.parser.getCurrentColumnNumber()
  }
  getCurrentByteIndex() {
    return this.parser.getCurrentByteIndex()
  }

  static createParser = cb => {
    const parser = new Parser()
    if (cb) {
      parser.on('startElement', cb)
    }
    return parser
  }
}
