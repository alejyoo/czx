import { simpleGit } from 'simple-git'
import { multiselect } from '@clack/prompts'

const git = simpleGit()
const status = await git.status()

const unstaged = [
  ...status.modified,
  ...status.not_added,
  ...status.deleted,
  ...status.renamed.map(f => f.from)
]

const selectedFiles = await multiselect({
  message: 'Select files to stage',
  options: unstaged.map(file => ({
    value: file,
    label: file
  })),
  minChoiceCount: 1,
  maxChoiceCount: unstaged.length
})
