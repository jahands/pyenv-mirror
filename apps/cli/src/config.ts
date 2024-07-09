export async function getRepoRoot() {
	return (await $`git rev-parse --show-toplevel`.text()).trim()
}
