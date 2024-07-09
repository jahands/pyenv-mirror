import { Command } from '@commander-js/extra-typings'
import { getRepoRoot } from '../helpers'

export const syncCmd = new Command('sync')
	.description('Synchronize pyenv database to R2')
	.action(async () => {
		const repoRoot = await getRepoRoot()
		const args = [
			['--config', `${repoRoot}/apps/cli/rclone.conf`],
			'-v',
			'copyto',
			`${repoRoot}/api/database.json`,
			'r2:pymirror/api/database.json',
		].flat()

		await $({
			verbose: true,
		})`rclone ${args}`
	})
