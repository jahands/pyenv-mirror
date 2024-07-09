import { Command } from '@commander-js/extra-typings'
import { z } from 'zod'
import { getRepoRoot } from '../config'

export const buildCmd = new Command('build')
	.description('Build pyenv database')
	.action(async () => {
		const repoRoot = await getRepoRoot()
		cd(repoRoot)
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
				const lines = fileContents.split('\n')
				for (let line of lines) {
					line = line.trim()
					if (!line.startsWith('install_package')) {
						continue
					}
					for (let block of line.split(' ')) {
						block = stripQuotes(block).trim()
						if (!block.startsWith('https')) {
							continue
						}
						let url = block
						if (!url.includes('#')) {
							continue
						}
						if (url.includes('${VERSION}')) {
							const version = PyVersion.safeParse(lines.find((line) => line.startsWith('VERSION=')))
							if (!version.success) {
								continue
							}
							url = url.replaceAll('${VERSION}', stripQuotes(version.data.split('=')[1]))
						}
						if (url.includes('${PYVER}')) {
							const pyver = PyVer.safeParse(lines.find((line) => line.startsWith('PYVER=')))
							if (!pyver.success) {
								continue
							}
							url = url.replaceAll('${PYVER}', stripQuotes(pyver.data.split('=')[1]))
						}
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
					}
				}
			}
			await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
		} finally {
			await $`rm -rf ${repoRoot}/pyenv`
		}
	})

// E.g. 3.11.0
const PyVersion = z.string().regex(/^\d+\.\d+\.\d+$/)

// E.g. 3.11
const PyVer = z.string().regex(/^\d+\.\d+$/)

function stripQuotes(str: string) {
	return str.replaceAll('"', '').replaceAll("'", '').trim()
}

export type PyMirrorDB = z.infer<typeof PyMirrorDB>
// Record of sha256 to url
export const PyMirrorDB = z.record(
	z.string().regex(/^[a-f\d]{64}$/),
	z.string().startsWith('https://')
)
