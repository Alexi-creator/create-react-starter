#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const { directoriesNotBeCopied, filesNotBeCopied, emptySettingsJson } = require('./constants/index.js');
const { copyDirectory } = require('./utils/copyDirectory.js');

const sourceDirectory = path.join(__dirname, `..${path.sep}`);
const targetDirectory = process.argv[2] || 'reactApp';

exec(`mkdir ${targetDirectory} && cd ${targetDirectory}`,
  (initErr) => {
    if (initErr) {
      console.error(`${process.argv[2]} -> this directory already exists, indicate another!`);
      return;
    }

    // copy files
    copyDirectory(sourceDirectory, targetDirectory, directoriesNotBeCopied, filesNotBeCopied);

    // edit package.json
    try {
      const dataPackageJson = fs.readFileSync(path.join(targetDirectory, 'package.json'), 'utf-8');
      const editedPackageJson = Object.entries(JSON.parse(dataPackageJson)).reduce((acc, [key, value]) => {
        if (key === "bin") return acc;

        if (emptySettingsJson.includes(key)) {
          acc[key] = "";
          return acc;
        }

        acc[key] = value;
        return acc;
      }, {});

      fs.writeFileSync(
        path.join(targetDirectory, 'package.json'),
        JSON.stringify(editedPackageJson, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error to read packageJson', error);
    }

    console.log('wait... packages are being installed');

    // set up packages and start app
    exec(`cd ${process.argv[2]} && git init && npm i && yarn start && exit 0`,
      (initErr) => {
        if (initErr) {
          console.error(initErr);
          return;
        }
      }
    )

    console.log('created-react-starter ready! 😀🚀🚀🚀');
  }
)