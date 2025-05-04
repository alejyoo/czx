import { simpleGit } from 'simple-git'
import { multiselect, isCancel, cancel } from '@clack/prompts'
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

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

const commitMessage = await generateText({
  model: groq('qwen-qwq-32b'),
  providerOptions: {
    groq: { reasoningFormat: 'parsed' }
  },
  prompt: `Generate a conventional commit message based on the following staged file changes. Only return the commit message, with no explanations or extra text. Use the appropriate conventional commit type (e.g., feat, fix, chore, refactor, etc.). \n\n${selectedFiles.join('\n')}`
})

console.log(`Generated commit message: ${commitMessage.text}`)
await git.add(selectedFiles)
await git.commit(commitMessage.text)
