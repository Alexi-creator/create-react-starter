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

const sourceDirectory = path.join(__dirname, `..${path.sep}`)
const targetDirectory = process.argv[2] || 'reactApp'

exec(`mkdir ${targetDirectory} && cd ${targetDirectory}`, (error) => {
  if (error) {
    console.error(
      `${targetDirectory} -> this directory already exists, indicate another!`
    )
    return
  }

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
    const editedPackageJson = Object.entries(
      JSON.parse(dataPackageJson)
    ).reduce((acc, [key, value]) => {
      if (key === 'bin') return acc

      if (emptySettingsJson.includes(key)) {
        acc[key] = ''
        return acc
      }

      acc[key] = value
      return acc
    }, {})

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
    path.join(`${targetDirectory}`, `${path.sep}`, '.gitignore'),
    `node_modules
    \nbuild
    \nyarn-error.log`,
    'utf-8'
  )

  // copy files
  fs.copyFileSync(
    path.join(
      `${sourceDirectory}`,
      `${path.sep}`,
      'bin',
      `${path.sep}`,
      'files',
      `${path.sep}`,
      'README.md'
    ),
    path.join(`${sourceDirectory}`, `${path.sep}`, 'README.md')
  )

  console.log('wait... packages are being installed')

  // set up packages and start app
  execSync(
    // `cd ${targetDirectory} && git init && yarn && yarn start && exit 0`,
    `cd ${targetDirectory} && git init && yarn`,
    (error) => {
      if (error) {
        console.error(error)
        return
      }
    }
  )

  console.log()
  console.log('created-react-starter ready! 😀🚀🚀🚀')
  console.log(`next step "cd ${targetDirectory} and yarn start"`)

  // remove npx-cache for the updated version to work
  exec(`npx clear-npx-cache`, (error) => {
    if (error) {
      console.error(error)
      return
    }
  })
})
