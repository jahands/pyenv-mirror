import { Context } from 'hono'
import type { FC } from 'hono/jsx'
import { css, Style } from 'hono/css'
import { App } from './types'

export async function getAboutPage(c: Context<App>): Promise<Response> {
	return c.html(<HomePage />)
}

const HomePage: FC = () => {
	return (
		<Layout>
			<div className="container">
				<header>
					{/* <img className="profile-image" src="https://i.uuid.rocks/icons/notion/pypy.png" /> */}
					<h1>PyMirror</h1>
					<p>Unofficial pyenv mirror</p>
				</header>
				<main>
					<h2>About</h2>
					<p>
						Pyenv is a simple and powerfull python version and environment management tool. This
						mirror speeds up download of python source files by caching with Cloudflare Cache
						Reserve.
					</p>
					<h2>Usage</h2>
					<p>
						<code>export PYTHON_BUILD_MIRROR_URL="https://pymirror.com/dist/python/"</code>
					</p>
				</main>
				<footer>
					<p>
						Made with ❤️ by <a href="https://github.com/jahands/pyenv-mirror">jahands</a>
					</p>
				</footer>
			</div>
		</Layout>
	)
}

const Layout: FC = (props) => {
	return (
		<html>
			<head>
				<title>PyMirror</title>
				<Style>{css`
					/* Global Styles */
					body {
						font-family: Arial, sans-serif;
						margin: 0;
						padding: 0;
						background-color: #f5f5f5;
						color: #333;
						line-height: 1.6;
					}

					/* Container */
					.container {
						max-width: 800px;
						margin: 0 auto;
						padding: 20px;
						background-color: #fff;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
					}

					/* Header */
					header {
						text-align: center;
						margin-bottom: 40px;
					}

					header h1 {
						font-size: 2.5em;
						margin-bottom: 10px;
						color: #333;
					}

					header p {
						font-size: 1.2em;
						color: #666;
					}

					/* Main Content */
					main {
						padding: 20px;
					}

					main h2 {
						font-size: 2em;
						margin-bottom: 20px;
						color: #333;
					}

					main p {
						margin-bottom: 20px;
						font-size: 1.1em;
						color: #666;
					}

					/* Profile Image */
					.profile-image {
						float: left;
						width: 150px;
						height: 150px;
						border-radius: 50%;
						margin-right: 20px;
						margin-bottom: 20px;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
					}

					/* Clearfix for Floats */
					.clearfix::after {
						content: '';
						clear: both;
						display: table;
					}

					/* Footer */
					footer {
						text-align: center;
						padding: 20px;
						margin-top: 40px;
						background-color: #333;
						color: #fff;
					}

					footer p {
						margin: 0;
						font-size: 0.9em;
					}
				`}</Style>
			</head>
			<body>{props.children}</body>
		</html>
	)
}
