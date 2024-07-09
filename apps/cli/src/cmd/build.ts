import { Command } from '@commander-js/extra-typings'
import { z } from 'zod'
import { getRepoRoot } from '../helpers'

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
							const version = lines.find((line) => line.startsWith('VERSION='))
							if (!version) {
								continue
							}
							url = url.replaceAll('${VERSION}', stripQuotes(version.split('=')[1]))
						}
						if (url.includes('${PYVER}')) {
							const pyver = lines.find((line) => line.startsWith('PYVER='))
							if (!pyver) {
								continue
							}
							url = url.replaceAll('${PYVER}', stripQuotes(pyver.split('=')[1]))
						}
						const { hostname } = new URL(url)
						if (hostname === 'ftpmirror.gnu.org') {
							url = url.replace('https://ftpmirror.gnu.org/', 'https://mirrors.ustc.edu.cn/gnu/')
						} else if (hostname === 'www.python.org') {
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

function stripQuotes(str: string) {
	return str.replaceAll('"', '').replaceAll("'", '').trim()
}

export type PyMirrorDB = z.infer<typeof PyMirrorDB>
// Record of sha256 to url
export const PyMirrorDB = z.record(
	z.string().regex(/^[a-f\d]{64}$/),
	z.string().startsWith('https://')
)
