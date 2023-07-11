const fs = require('fs')
const path = require('path')

function copyDirectory(
  sourceDir,
  targetDir,
  directoriesNotBeCopied = [],
  filesNotBeCopied = []
) {
  // create directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir)
  }

  // get list files and directories in root directory
  const files = fs.readdirSync(sourceDir)

  // copy files and directories
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file)
    const targetPath = path.join(targetDir, file)

    if (fs.statSync(sourcePath).isDirectory()) {
      // don't copy some directories
      if (!directoriesNotBeCopied.includes(file))
        copyDirectory(sourcePath, targetPath)
    } else {
      // don't copy some files
      if (!filesNotBeCopied.includes(file))
        fs.copyFileSync(sourcePath, targetPath)
    }
  })
}

module.exports = { copyDirectory }
