/** Resolves variables in a script so that it's easier to parse.
 */
export function resolveScriptVars(rawScript: string) {
	const vars: Record<string, string> = {}
	let script = rawScript
	let runAgain = true
	let runs = 0
	while (runAgain) {
		runs++
		if (runs > 10) {
			throw new Error('failed to resolve script variables')
		}
		runAgain = false
		const lines = script.split('\n').map((line) => line.trim())
		for (const line of lines) {
			// Ignore ${1}, etc.
			const isInputVar = line.match(/.*\${\d+}.*/)
			const match = line.match(/^(local)?\s?(\w+)=(.*)$/)
			if (match && !isInputVar) {
				vars[match[2]] = stripQuotes(match[3])
			}
		}
		for (const [key, value] of Object.entries(vars)) {
			if (value.includes('${')) {
				runAgain = true
			} else {
				script = script.replaceAll('${' + key + '}', stripQuotes(value))
			}
		}
	}
	return script
}

export function stripQuotes(str: string) {
	return str.replaceAll('"', '').replaceAll("'", '').trim()
}
