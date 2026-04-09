/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'

const locales = ['en', 'es']
const messagesDir = path.join(process.cwd(), 'messages')

/**
 * Loads the JSON file for a given locale.
 */
function loadJson(locale: string) {
  const filePath = path.join(messagesDir, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/**
 * Saves the JSON file for a given locale, ensuring keys are sorted.
 */
function saveJson(locale: string, data: any) {
  const filePath = path.join(messagesDir, `${locale}.json`)
  const sortedData = sortObject(data)
  fs.writeFileSync(filePath, `${JSON.stringify(sortedData, null, 2)}\n`)
}

/**
 * Recursively sorts object keys.
 */
function sortObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObject)
  }

  const sorted: any = {}
  Object.keys(obj)
    .sort()
    .forEach(key => {
      sorted[key] = sortObject(obj[key])
    })

  return sorted
}

/**
 * Sets a value at a given path in the object.
 */
function setKey(obj: any, keyPath: string, value: string) {
  const keys = keyPath.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

/**
 * Main command handler.
 */
function main() {
  const args = process.argv.slice(2)
  const [command] = args

  if (command === 'add') {
    const [_, keyPath, enValue, esValue] = args
    if (!keyPath || !enValue || !esValue) {
      console.error('Usage: pnpm manage-i18n add <key.path> "<EN Value>" "<ES Value>"')
      process.exit(1)
    }

    const enData = loadJson('en')
    const esData = loadJson('es')

    setKey(enData, keyPath, enValue)
    setKey(esData, keyPath, esValue)

    saveJson('en', enData)
    saveJson('es', esData)

    console.log(`Successfully added key: ${keyPath}`)
  } else if (command === 'sort') {
    locales.forEach(locale => {
      const data = loadJson(locale)
      saveJson(locale, data)
    })
    console.log('Sorted all language files.')
  } else {
    console.log('Available commands:')
    console.log('  add <key.path> "<EN Value>" "<ES Value>" - Adds or updates a translation key')
    console.log(
      '  sort                                     - Sorts all language files alphabetically'
    )
  }
}

try {
  main()
} catch (error) {
  console.error(error)
}
