#!/usr/bin/env node

import { promises } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec, execSync } from 'child_process'

import chalk from 'chalk'

import {
  directoriesNotBeCopied,
  filesNotBeCopied,
  emptySettingsJson,
  removeKeyJson,
  removePackageJson,
} from './constants/index.js'
import { copyDirectory } from './utils/copyDirectory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const directoryName = process.argv[2] || 'reactApp'
const sourceDirectory = join(__dirname, '../')
const targetDirectory = join(process.env.INIT_CWD || process.env.PWD, '/', directoryName)

const app = async () => {
  await promises.mkdir(targetDirectory)

  // copy src
  copyDirectory(
    sourceDirectory,
    targetDirectory,
    directoriesNotBeCopied,
    filesNotBeCopied
  )

  // edit package.json
  try {
    const dataPackageJson = await promises.readFile(
      join(targetDirectory, 'package.json'),
      'utf-8'
    )
    const editedPackageJson = Object.entries(
      JSON.parse(dataPackageJson)
    ).reduce((acc, [key, value]) => {
      if (removeKeyJson.includes(key)) return acc

      if (key === 'dependencies') {
        const dependencies = Object.entries(value).filter(
          ([packageItem]) => !removePackageJson.includes(packageItem)
        )
        acc[key] = Object.fromEntries(dependencies)

        return acc
      }

      if (emptySettingsJson.includes(key)) {
        acc[key] = ''
        return acc
      }

      acc[key] = value
      return acc
    }, {})

    await promises.writeFile(
      join(targetDirectory, 'package.json'),
      JSON.stringify(editedPackageJson, null, 2),
      'utf-8'
    )
  } catch (error) {
    console.error('Error to read packageJson', error)
  }

  // create .gitignore since the original file is not copied
  await promises.writeFile(
    join(`${targetDirectory}`, '/', '.gitignore'),
    `node_modules
build
yarn-error.log`,
    'utf-8'
  )

  // copy files
  await promises.copyFile(
    join(`${sourceDirectory}`, '/', 'bin', '/', 'files', '/', 'README.md'),
    join(`${targetDirectory}`, '/', 'README.md')
  )

  // remove npx-cache for the updated version to work
  exec('npx clear-npx-cache', (error) => {
    if (error) {
      console.error(error)
      return
    }
  })

  // set up packages
  try {
    console.log(chalk.cyan('wait... packages are being installed:'))
    execSync(`cd ${directoryName} && git init && yarn && git add . && git commit -m "initial commit react-starter" && exit 0`, {
      stdio: 'inherit',
    })
    console.log()
    console.log(chalk.cyan('created-react-starter ready! 😀🚀🚀🚀'))
    console.log(chalk.cyan(`next step: "cd ${directoryName} and yarn start"`))
  } catch (error) {
    console.log(chalk.red('Packages not installed:'), error)
  }
}

app()
