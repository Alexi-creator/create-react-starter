const directoriesNotBeCopied = ['bin', '.git', 'node_modules']
const filesNotBeCopied = ['.npmignore']
const emptySettingsJson = [
  'name',
  'version',
  'keywords',
  'author',
  'description',
]

module.exports = { directoriesNotBeCopied, filesNotBeCopied, emptySettingsJson }
