import { argument, Container, dag, Directory, func, object, Secret } from '@dagger.io/dagger'
import { envStorage, ParamsToEnv, shell } from '@jahands/dagger-helpers'

const sh = shell('bash')

const projectIncludes: string[] = [
	// dirs
	'apps/',
	'api/',

	// files
	'.gitignore',
	'.mise.toml',
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
				'**/node_modules/',
				'**/.env',
				'**/*.env',
				'**/.secret',
				'**/.turbo/',
				'**/dist/',
				'**/.DS_Store',
				'**/dagger/sdk/',
				'**/.dagger/sdk/',
			],
		})
		source: Directory
	) {
		this.source = source
	}

	@func()
	getSource(): Directory {
		return this.source
	}

	@func()
	async setupWorkspace(): Promise<Container> {
		return dag
			.container()
			.from('debian:bookworm-slim')
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
			.withExec(sh('curl -fsSL https://sh.uuid.rocks/install/mise | bash'))
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

		let con = workspace
			// copy over minimal files needed for installing tools/deps
			.withDirectory('/work', this.source.directory('/'), {
				include: [
					'pnpm-lock.yaml',
					'pnpm-workspace.yaml',
					'package.json',
					'**/package.json',
				],
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
	async buildPyenvDb(): Promise<Directory> {
		const con = await this.installDeps()

		const result = con
			.withExec(sh('bun run apps/cli/src/index.ts build'))
			.withExec(sh('bun run apps/cli/src/index.ts verify'))

		return result.directory('/work/api')
	}

	@func()
	@ParamsToEnv()
	async syncPyenvDb(
		AWS_ACCESS_KEY_ID?: Secret,
		AWS_SECRET_ACCESS_KEY?: Secret
	): Promise<void> {
		const con = this.withEnv(await this.installDeps())
		const dbDir = await this.buildPyenvDb()

		await con
			.withFile('/work/database.json', dbDir.file('database.json'))
			.withExec(
				sh(
					'rclone --config apps/cli/rclone.conf --s3-no-check-bucket copyto database.json r2:pymirror/api/database.json'
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