import http from 'http'
import fs from 'fs'
import path from 'path'
import * as babel from 'babel-core'
import sass from 'node-sass'

import {argsParser} from '../utils/_utils'
import {ignores, onlys, presets, plugins} from '../config/babel'

const pwd = __dirname
// $ serve [src]

async function serve(args) {
    args = (args) ? args.split(' ') : process.argv.slice(3, process.argv.length)
    let params = argsParser(args)

    const es6 = (params.es6) ? params.es6 : false
    const scss = (params.scss) ? params.scss : false
    const port = (params.port) ? params.port : 3000

    const server = http.createServer((request, response) => {
        console.log('request ', request.url)

        //cors
        response.setHeader('Access-Control-Allow-Origin', '*')
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
        response.setHeader('Access-Control-Allow-Credentials', true)

        let filePath = request.url

        let qPos = filePath.indexOf('?');
        if (qPos > -1) {
            filePath = filePath.slice(0, qPos);
        }

        filePath = filePath === '/' ? `${args[0]}/index.html` : `${args[0]}${filePath}`
        filePath = path.resolve(filePath)

        let extname = String(path.extname(filePath)).toLowerCase()
        let contentType = 'text/html'
        let mimeTypes = {
            '.html': 'text/html',
            '.js':   'text/javascript',
            '.css':  'text/css',
            '.json': 'application/json',
            '.png':  'image/png',
            '.jpg':  'image/jpg',
            '.gif':  'image/gif',
            '.wav':  'audio/wav',
            '.mp4':  'video/mp4',
            '.woff': 'application/font-woff',
            '.woff2': 'application/font-woff2',
            '.ttf':  'applilcation/font-ttf',
            '.eot':  'application/vnd.ms-fontobject',
            '.otf':  'application/font-otf',
            '.svg':  'application/image/svg+xml'
        }

        contentType = mimeTypes[extname] || 'application/octect-stream'

        if (scss && filePath.indexOf('styles.css') > -1){
            let {css} = sass.renderSync({
                file: 'src/scss/styles.scss'
            })
            response.writeHead(200, { 'Content-Type': 'text/css' })
            response.end(css.toString(), 'utf-8')
            return
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if(error.code == 'ENOENT'){
                    response.writeHead(404)
                    response.end('Not found', 'utf-8')
                    return
                }
                response.writeHead(500)
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n')
                response.end()
                return
            }

            if (es6 && contentType === 'text/javascript'){
                let ignore = false
                for (var i = 0; i < ignores.length; i++) {
                    if (filePath.indexOf(ignores[i]) > -1){
                        ignore = true
                        break
                    }
                }

                for (var i = 0; i < onlys.length; i++) {
                    if (filePath.indexOf(onlys[i])>-1){
                        ignore = false
                        break
                    }
                }


                if (!ignore){
                    let {code} = babel.transform(content, {
                        presets,
                        plugins,
                        sourceRoot: pwd
                    })
                    content = code
                }
            }

            response.writeHead(200, { 'Content-Type': contentType })
            response.end(content, 'utf-8')
            return
        })

    })
    .on('error', function (e) {
        // Handle your error here
        console.log(e)
    })

    server.listen(port)
    console.log(`Serving folder [${args[0]}] is listening on port ${port}`);
}

export default serve
