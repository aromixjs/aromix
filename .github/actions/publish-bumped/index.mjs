import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

if (!existsSync('.bumped')) {
    console.log('No .bumped manifest found, skipping')
    process.exit(0)
}

const content = readFileSync('.bumped', 'utf8')
const lines = content.trim().split('\n').filter(Boolean)

execSync('pnpm -r build', { stdio: 'inherit' })

for (const line of lines) {
    const parts = line.split(' ')
    const name = parts[0]
    const version = parts[1]

    let alreadyPublished = false

    try {
        const result = execSync(`npm view "${name}" versions --json`, { stdio: 'pipe' })
        const versions = JSON.parse(result.toString())
        const list = Array.isArray(versions) ? versions : [versions]
        alreadyPublished = list.includes(version)
    } catch {
        // package doesn't exist on npm yet, publish it
    }

    if (alreadyPublished) {
        console.log(`✓ ${name}@${version} already published`)
    } else {
        console.log(`→ Publishing ${name}@${version}...`)
        execSync(`pnpm --filter "${name}" publish --access public --no-git-checks`, {
            stdio: 'inherit',
        })
    }
}
