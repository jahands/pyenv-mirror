import { Command } from '@commander-js/extra-typings'
import { z } from 'zod'
import { getRepoRoot } from '../config'
import { resolveScriptVars, stripQuotes } from '../var-resolver'

export const buildCmd = new Command('build')
	.description('Build pyenv database')
	.action(async () => {
		const repoRoot = await getRepoRoot()
		cd(repoRoot)
		let foundCount = 0
		try {
			const dbPath = `${repoRoot}/api/database.json`
			const db: PyMirrorDB = {}
			await $`git clone --depth=1 https://github.com/pyenv/pyenv.git`
			const versionsPath = `plugins/python-build/share/python-build`
			const files = await $`find ${repoRoot}/pyenv/${versionsPath} -type f`.lines()
			if (files.length === 0) {
				throw new Error('No files found')
			}
			for (const file of files) {
				z.string().startsWith('/').parse(file)
				const fileContents = await fs.readFile(file, 'utf-8')

				// Some files have variables in them, so we need to resolve them
				const script = resolveScriptVars(fileContents)
				const lines = script
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => line.startsWith('install_package'))

				for (let line of lines) {
					let url = line
						.split(' ')
						.map((block) => stripQuotes(block).trim())
						.find((block) => block.startsWith('https') && block.includes('#'))
					if (!url) {
						continue
					}
					url = stripQuotes(url)
					const { hostname } = new URL(url)
					if (hostname === 'www.python.org') {
						// python.org blocks CF IPs :(
						url = url.replace(
							'https://www.python.org/ftp/python/',
							'https://registry.npmmirror.com/-/binary/python/'
						)
					}
					const sha256 = url.split('#')[1]
					db[sha256] = url
					foundCount++
				}
			}
			if (foundCount === 0) {
				throw new Error('no data found')
			}
			await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
		} finally {
			await $`rm -rf ${repoRoot}/pyenv`
		}
	})

export type PyMirrorDB = z.infer<typeof PyMirrorDB>
// Record of sha256 to url
export const PyMirrorDB = z.record(
	z.string().regex(/^[a-f\d]{64}$/),
	z.string().startsWith('https://')
)
