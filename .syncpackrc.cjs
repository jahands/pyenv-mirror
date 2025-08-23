// @ts-check
/** @type {import("syncpack").RcFile} */
const config = {
	indent: '\t',
	lintFormatting: false,
	// dependencyTypes: ['prod'], // disabled filter to enable all types
	versionGroups: [
		{
			label: 'local packages',
			packages: ['**'],
			dependencies: ['$LOCAL'],
			dependencyTypes: ['!local'], // Exclude the local package itself
			pinVersion: 'workspace:*',
		},
	],
	semverGroups: [
		{
			label: 'pin all deps',
			range: '',
			dependencies: ['**'],
			packages: ['**'],
			// url is not supported so we need to exclude it
			// to allow using deps from pkg.pr.new
			specifierTypes: ['!url'],
		},
	],
}

module.exports = config
