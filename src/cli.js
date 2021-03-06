import path from 'path'
import program from 'commander'
import run from './common/run'
import shell from 'shelljs'
import updateNotifier from 'update-notifier'

const pkg = require('../package.json')
const header =  '\n'+
                '    __ _____             _     _      _       _ _   _ _           _ \n'+
                ' __|  | __  |   ___     |_|___| |_   | |_ _ _|_| |_| | |_ ___ ___| |\n'+
                '|  |  | __ -|  |___|    | | -_|  _|  | . | | | | | . |  _| . | . | |\n'+
                '|_____|_____|          _| |___|_|    |___|___|_|_|___|_| |___|___|_|\n'+
                '                      |___|                                         \n'+
                `Version: ${pkg.version}`

export const main = function(){
    updateNotifier({pkg}).notify()

    program
        .version(pkg.version)
        .description(header)

    program
        .command('run <cmd>').allowUnknownOption(true)
        .description('Execute the given script')
        .action(function(cmd, options){
            let localTool = path.resolve(`tool/${cmd}.js`)
            let m

            try {
                m = require(localTool).default
            } catch(error) {
                try {
                    let composedCmd = cmd.split('.')
                    let globalTool = (composedCmd.length > 1) ? `./${composedCmd[0]}/${composedCmd[1]}.js` : `./scripts/${cmd}.js`
                    globalTool = path.resolve(__dirname, globalTool)
                    m = require(globalTool).default
                } catch(e) {
                    console.error(e.stack)
                    console.log(`Warn: project ${error}`)
                    console.log(`Warn: global ${e}`)
                    console.log('Neither local/modules task found...exiting')
                    process.exit(0)
                }
            }

            return run(m)
                .catch(err => { console.error(err.stack); process.exit(1) })
        })

    program
        .command('list')
        .description('List of available scripts')
        .action(function(cmd, options){
            console.log(header)
            console.log(`Scripts list:`)
            shell.ls(`${path.join(__dirname, 'scripts/*.js')}`)
                .map(f=>{
                    let p = f.split('/')
                    console.log(` - ${p.slice(p.length-1, p.length)}`)
                })
        })

    program.parse(process.argv)
    if (!program.args.length) program.help()
}