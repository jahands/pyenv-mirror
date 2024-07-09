import 'zx/globals'
import { describe, it, test, expect } from 'vitest'
import { resolveScriptVars, stripQuotes } from './var-resolver'

describe('resolveScriptVars', () => {
	const cases: Array<[string, string, string]> = [
		[
			'multiple vars',
			`
			foo=bar
			baz=qux
			quux="\${foo}"
			corge="\${baz}"
		`,
			`
			foo=bar
			baz=qux
			quux="bar"
			corge="qux"
		`,
		],
		[
			'multiple vars with quotes',
			`
			foo=bar
			baz=qux
			quux="\${foo}"
			corge="\${baz}"
			grault="\${quux}"
		`,
			`
			foo=bar
			baz=qux
			quux="bar"
			corge="qux"
			grault="bar"
		`,
		],
		[
			'multiple vars with quotes and spaces',
			`
			foo=bar
			baz=qux
			quux="\${foo}"
			corge="\${baz}"
			grault="\${quux}"
			garply="\${corge}"
		`,
			`
			foo=bar
			baz=qux
			quux="bar"
			corge="qux"
			grault="bar"
			garply="qux"
			`,
		],
		[
			'multiple vars in same line',
			`
			foo=bar
			baz=qux
			quux="\${foo}\${baz}"
			`,
			`
			foo=bar
			baz=qux
			quux="barqux"
			`,
		],
	]

	for (const tt of cases) {
		test(tt[0], () => {
			const [_name, script, expected] = tt
			expect(resolveScriptVars(trim(script))).toBe(trim(expected))
		})
	}

	test('real world example', async () => {
		const script = `
VERSION='7.3.8'
PYVER='3.8'

# https://www.pypy.org/checksums.html
aarch64_hash=fe41df391f87239925e573e195e631a9d03d37f471eb1479790ee13ca47a28af
linux32_hash=bea4b275decd492af6462157d293dd6fcf08a949859f8aec0959537b40afd032
linux64_hash=089f8e3e357d6130815964ddd3507c13bd53e4976ccf0a89b5c36a9a6775a188
osx64_hash=de1b283ff112d76395c0162a1cf11528e192bdc230ee3f1b237f7694c7518dee
s390x_hash=0c46527770ec1322b98942860ad3551767d3e09d4481bcb49abd92001a293840
win64_hash=0894c468e7de758c509a602a28ef0ba4fbf197ccdf946c7853a7283d9bb2a345

### end of manual settings - following lines same for every download

function pypy_pkg_data {
    # pypy architecture
    local ARCH="\${1}"

    local basesrc="pypy\${PYVER}-\${VERSION}-src"
    local basever="pypy\${PYVER}-v\${VERSION}"
    local baseurl="https://downloads.python.org/pypy/\${basever}"

    # defaults
    local cmd='install_package'  # use bz2
    local pkg="\${ARCH}" # assume matches
    local url="\${baseurl}-\${pkg}.tar.bz2" # use bz2
    local hash='' # undefined

    case "\${pkg}" in
    'linux-aarch64' )
      hash="\${aarch64_hash}"
      url="\${baseurl}-aarch64.tar.bz2" # diff url
      ;;
    'linux' )
      hash="\${linux32_hash}"
      pkg='linux32'  # package name revised
      url="\${baseurl}-\${pkg}.tar.bz2"  # new url
      ;;
    'linux64' )
      hash="\${linux64_hash}"
      ;;
    'osx64' )
      if require_osx_version "10.13"; then
        hash="\${osx64_hash}"
      else
        { echo
          colorize 1 "ERROR"
          echo ": The binary distribution of PyPy is not available for \$(pypy_architecture 2>/dev/null || true), OS X < 10.13."
          echo "try '\${basesrc}' to build from source."
          echo
        } >&2
        exit 1
      fi
      ;;
    's390x' )
      hash="\${s390x_hash}"
      ;;
    'win64' )
      hash="\${win64_hash}"
      cmd='install_zip'  # diff command
      url="\${baseurl}-\${pkg}.zip"  # zip rather than bz2
      ;;
    * )
      { echo
        colorize 1 "ERROR"
        echo ": The binary distribution of PyPy is not available for \$(pypy_architecture 2>/dev/null || true)."
        echo "try '\${basesrc}' to build from source."
        echo
      } >&2
      exit 1
      ;;
    esac

    # result - command, package dir, url+hash
    echo "\${cmd}" "\${basever}-\${pkg}" "\${url}#\${hash}"
}

# determine command, package directory, url+hash
declare -a pd="\$(pypy_pkg_data "\$(pypy_architecture 2>/dev/null || true)")"

# install
\${pd[0]} "\${pd[1]}" "\${pd[2]}" 'pypy' "verify_py\${PYVER//./}" 'ensurepip'
`

		expect(resolveScriptVars(trim(script))).toMatchFileSnapshot('snapshots/real-world-example')
	})

	// it.only('should resolve longscript.txt', async () => {
	// 	const file = import.meta.url
	// 	const dir = path.dirname(file)
	// 	const fixtures = path.join(dir, 'fixtures')
	// 	const script = await $`cat ./fixtures/longscript.txt`
	// 	console.log(script)
	// })
})

describe('stripQuotes', () => {
	it('should strip quotes', () => {
		expect(stripQuotes('"foo"')).toBe('foo')
		expect(stripQuotes("'foo'")).toBe('foo')
	})
})

/** Trim all leading/trailing tabs and spaces from each line */
function trim(str: string) {
	let s = str
		.replace(/^\s+/, '')
		.split('\n')
		.map((line) => line.replace(/^\s+/, '').replace(/\s+$/, ''))
	while (s[0] === '') {
		s = s.slice(1)
	}
	while (s[s.length - 1] === '') {
		s = s.slice(0, -1)
	}
	return s.join('\n')
}
