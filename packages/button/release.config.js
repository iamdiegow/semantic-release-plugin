module.exports = {
	branches: [
		'main'
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		'semrel-react-releaser'
	],
	dryRun: false,
	ci: false,
	debug: true
}
