#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { exec, execSync } = require('child_process')

const {
  directoriesNotBeCopied,
  filesNotBeCopied,
  emptySettingsJson,
} = require('./constants/index.js')
const { copyDirectory } = require('./utils/copyDirectory.js')

const directoryName = process.argv[2] || 'reactApp'

const sourceDirectory = path.join(__dirname, '../')
const targetDirectory = `${process.env.PWD}/${directoryName}`

fs.mkdirSync(targetDirectory, (err) => {
  if (err) throw err
})

// copy src
copyDirectory(
  sourceDirectory,
  targetDirectory,
  directoriesNotBeCopied,
  filesNotBeCopied
)

// edit package.json
try {
  const dataPackageJson = fs.readFileSync(
    path.join(targetDirectory, 'package.json'),
    'utf-8'
  )
  const editedPackageJson = Object.entries(JSON.parse(dataPackageJson)).reduce(
    (acc, [key, value]) => {
      if (key === 'bin') return acc

      if (emptySettingsJson.includes(key)) {
        acc[key] = ''
        return acc
      }

      acc[key] = value
      return acc
    },
    {}
  )

  fs.writeFileSync(
    path.join(targetDirectory, 'package.json'),
    JSON.stringify(editedPackageJson, null, 2),
    'utf-8'
  )
} catch (error) {
  console.error('Error to read packageJson', error)
}

// create .gitignore since the original file is not copied
fs.writeFileSync(
  path.join(`${targetDirectory}`, '/', '.gitignore'),
  `node_modules
build
yarn-error.log`,
  'utf-8'
)

// copy files
fs.copyFileSync(
  path.join(`${sourceDirectory}`, '/', 'bin', '/', 'files', '/', 'README.md'),
  path.join(`${targetDirectory}`, '/', 'README.md')
)

console.log('wait... packages are being installed')

// set up packages
execSync(`cd ${targetDirectory} && git init && yarn && exit 0`, (error) => {
  if (error) {
    console.error(error)
    return
  }
})

console.log()
console.log('created-react-starter ready! 😀🚀🚀🚀')
console.log(`next step: "cd ${directoryName} and yarn start"`)

// remove npx-cache for the updated version to work
exec(`npx clear-npx-cache`, (error) => {
  if (error) {
    console.error(error)
    return
  }
})
