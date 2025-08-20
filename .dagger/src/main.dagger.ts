import { argument, Container, dag, Directory, File, func, object, Secret } from '@dagger.io/dagger'
import { envStorage, ParamsToEnv, shell } from '@jahands/dagger-helpers'
import { fmt } from 'llm-tools'
const sh = shell('bash')

const projectIncludes: string[] = [
	// dirs
	'.git/',
	'apps/',
	'api/',

	// files
	'.gitignore',
	'.mise.toml',
	'.prettierrc.cjs',
	'package.json',
	'pnpm-lock.yaml',
	'pnpm-workspace.yaml',
	'tsconfig.json',
]

@object()
export class PyenvMirror {
	source: Directory

	constructor(
		@argument({
			defaultPath: '/',
			ignore: [
				// dirs
				'**/node_modules/',
				'**/.turbo/',
				'**/dist/',
				'**/dagger/sdk/',
				'**/.dagger/sdk/',

				// files
				'**/.env',
				'**/*.env',
				'**/.DS_Store',
			],
		})
		source: Directory
	) {
		this.source = source
	}

	@func()
	async setupWorkspace(): Promise<Container> {
		return dag
			.container()
			.from('public.ecr.aws/debian/debian:12-slim')
			.withWorkdir('/work')
			.withEnvVariable('HOME', '/root')
			.withExec(
				sh(
					[
						'apt-get update',
						'apt-get install -y jq git curl unzip python3 python3-pip pipx',
						'rm -rf /var/lib/apt/lists/*',
					].join(' && ')
				)
			)
			.withExec(sh('curl -fsSL https://sh.uuid.rocks/install/mise | MISE_VERSION=v2025.8.13 bash'))
			.withEnvVariable('PATH', '$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH', {
				expand: true,
			})
			.withFile('.mise.toml', this.source.file('.mise.toml'))
			.withExec(sh('mise trust --yes && mise install --yes && mise reshim'))
			.sync()
	}

	@func()
	async installDeps(): Promise<Container> {
		const workspace = await this.setupWorkspace()

		const con = workspace
			// copy over minimal files needed for installing tools/deps
			.withDirectory('/work', this.source.directory('/'), {
				include: ['pnpm-lock.yaml', 'pnpm-workspace.yaml', 'package.json', '**/package.json'],
			})

			// install pnpm deps
			.withMountedCache('/pnpm-store', dag.cacheVolume('pnpm-store'))
			.withExec(sh('pnpm config set store-dir /pnpm-store'))
			.withExec(sh('FORCE_COLOR=1 pnpm install --frozen-lockfile --child-concurrency=10'))

			// copy over the rest of the project
			.withDirectory('/work', this.source.directory('/'), { include: projectIncludes })

		return con
	}

	@func()
	async buildPyenvDB(): Promise<Container> {
		const con = (await this.installDeps())
			.withExec(sh('bun run apps/cli/src/index.ts build'))
			.withExec(sh('bun run apps/cli/src/index.ts verify'))

		// note: the actual export path here is meaningless
		await con.file('/work/api/database.json').export('./api/database.json')

		return con
	}

	@func()
	@ParamsToEnv()
	async syncPyenvDB(AWS_ACCESS_KEY_ID?: Secret, AWS_SECRET_ACCESS_KEY?: Secret): Promise<void> {
		const [deps, build] = await Promise.all([this.installDeps(), this.buildPyenvDB()])

		const con = this.withEnv(deps)
		const dbFile = build.file('/work/api/database.json')

		await con
			.withFile('/work/database.json', dbFile)
			.withExec(
				sh(
					fmt.oneLine(`
						rclone --config apps/cli/rclone.conf
							--s3-no-check-bucket
							copyto database.json r2:pymirror/api/database.json
					`)
				)
			)
			.sync()
	}

	// =============================== //
	// =========== Helpers =========== //
	// =============================== //

	/**
	 * Add env vars / secrets to a container based on AsyncLocalStorage context
	 */
	private withEnv(
		con: Container,
		{
			color = true,
		}: {
			/**
			 * Set FORCE_COLOR=1
			 * @default true
			 */
			color?: boolean
		} = {}
	): Container {
		let c = con
		const context = envStorage.getStore()

		if (color) {
			c = c.withEnvVariable('FORCE_COLOR', '1')
		}

		if (context) {
			const { currentParams, mergedEnv } = context

			for (const [key, value] of Object.entries(mergedEnv)) {
				if (currentParams.has(key) && value) {
					if (typeof value === 'string') {
						c = c.withEnvVariable(key, value)
					} else {
						c = c.withSecretVariable(key, value as Secret)
					}
				}
			}
		} else {
			throw new Error('AsyncLocalStorage store not found in withEnv')
		}
		return c
	}
}
