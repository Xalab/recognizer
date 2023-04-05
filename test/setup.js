const path = require('path')
const { Application } = require('spectron')

const appPath = () => {
  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, '..', '.tmp', 'mac', 'Recognizer.app', 'Contents', 'MacOS', 'Recognizer')
    case 'linux':
      return path.join(__dirname, '..', '.tmp', 'linux', 'Recognizer')
    case 'win32':
      return path.join(__dirname, '..', '.tmp', 'win-unpacked', 'Recognizer.exe')
    default:
      throw Error(`Unsupported platform ${process.platform}`)
  }
}
global.app = new Application({ path: appPath() })
