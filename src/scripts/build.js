import run, {recreateDir,copy,clean,jet,rjsOptimizer,components,htmlReplace} from '../index'

// $ build

async function build(args) {
    await run(recreateDir, 'temp dist')
    await run(jet)
    await run(assets, 'temp -m --bower-modules')
    await run(components, 'temp')
    await run(htmlReplace, 'temp --production')
    await run(rjsOptimizer)
    await run(copy, '-rf src/assets dist')
    await run(copy, '-rf temp/index.html dist')
    await run(copy, '-rf temp/scripts.js dist')
    await run(copy, '-rf temp/styles.css dist')
    await run(clean, 'temp')
}

export default build;