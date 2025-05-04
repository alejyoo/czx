import { simpleGit } from 'simple-git'
import { multiselect, isCancel, cancel } from '@clack/prompts'

const git = simpleGit()
const status = await git.status()

const unstaged = status.files
  .filter(file => file.index === ' ' || file.index === '?')
  .map(file => file.path)

if (unstaged.length === 0) {
  console.log('No unstaged files found.')
  process.exit(0)
}

const selectedFiles = await multiselect({
  message: 'Select files to stage',
  options: unstaged.map(file => ({
    value: file,
    label: file
  })),
  minChoiceCount: 1,
  maxChoiceCount: unstaged.length
})

if (isCancel(selectedFiles)) {
  process.exit(0)
}

git.commit('Staged selected files', selectedFiles)
