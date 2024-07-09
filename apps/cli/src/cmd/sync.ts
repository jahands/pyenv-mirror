import 'zx/globals'
import { Command } from '@commander-js/extra-typings'

export const syncCmd = new Command('sync')
	.description('Synchronize pyenv database to R2')
	.action(async () => {
		const repoRoot = await getRepoRoot()
		await $({
			verbose: true,
		})`rclone -v copyto ${repoRoot}/api/database.json r2:pyenv-mirror/api/database.json`
	})

async function getRepoRoot() {
	return (await $`git rev-parse --show-toplevel`.text()).trim()
}
