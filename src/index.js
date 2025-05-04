import { simpleGit } from 'simple-git'
import { multiselect, isCancel } from '@clack/prompts'
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

const diffs = await Promise.all(
  selectedFiles.map(async file => {
    const diff = await git.diff([file])
    return `--- ${file} ---\n${diff}`
  })
)

const fullDiff = diffs.join('\n\n')

const commitMessage = await generateText({
  model: groq('qwen-qwq-32b'),
  providerOptions: {
    groq: { reasoningFormat: 'parsed' }
  },
  prompt: `You are a helpful AI that writes concise and descriptive conventional commit messages. Analyze the following code diffs and return only the commit message (e.g., feat: add login page). Do not include explanations or headers.\n\n${fullDiff}`
})

console.log(`Generated commit message: ${commitMessage.text}`)
await git.add(selectedFiles)
await git.commit(commitMessage.text)
