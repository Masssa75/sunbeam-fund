const fs = require('fs')
const path = require('path')

// Read package.json to get version
const packageJson = require('../package.json')
const version = packageJson.version

// Get current date
const date = new Date().toISOString().split('T')[0]

// Path to VersionBadge component
const versionBadgePath = path.join(__dirname, '..', 'src', 'components', 'VersionBadge.tsx')

// Read current content
const content = fs.readFileSync(versionBadgePath, 'utf8')

// Update version and date
const updatedContent = content
  .replace(/const version = "[^"]*"/, `const version = "${version}"`)
  .replace(/const deployDate = "[^"]*"/, `const deployDate = "${date}"`)

// Write back
fs.writeFileSync(versionBadgePath, updatedContent)

console.log(`✅ Updated VersionBadge to v${version} • ${date}`)