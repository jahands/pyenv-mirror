import { Command } from '@commander-js/extra-typings'
import { z } from 'zod'
import { getRepoRoot } from '../helpers'

export const verifyCmd = new Command('verify')
	.description('Verify pyenv database')
	.action(async () => {
		const repoRoot = await getRepoRoot()
		const dbPath = `${repoRoot}/api/database.json`
		const dbText = await fs.readFile(dbPath, 'utf-8')
		PyMirrorDB.parse(JSON.parse(dbText))
	})

export type PyMirrorDB = z.infer<typeof PyMirrorDB>
// Record of sha256 to url
export const PyMirrorDB = z.record(
	z.string().regex(/^[a-f\d]{64}$/),
	z.string().startsWith('https://')
)
