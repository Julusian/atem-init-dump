import { writeFileSync } from 'fs'
import { AtemSocket } from 'atem-connection/dist/lib/atemSocket'
import { DEFAULT_PORT } from 'atem-connection'

if (process.argv.length < 3) {
    console.error('Missing address parameter')
    process.exit(1)
}

const IP = process.argv[2]

const socket = new AtemSocket({
    debug: false,
    log: console.log,
    disableMultithreaded: true,
    address: IP,
    port: DEFAULT_PORT
})
socket.on('disconnect', () => {
    console.log('disconnect')
    process.exit(1)
})


const output: string[] = []

socket.on('commandsReceived', cmds => {
    const initComplete = cmds.find(cmd => cmd.constructor.name === 'InitCompleteCommand')
    if (initComplete) {
        console.log('complete')
        writeFileSync('output.data', output.join('\n'))
        process.exit(0)
    }
})

const origParse = ((socket as any)._parseCommands).bind(socket)
;(socket as any)._parseCommands = (payload: Buffer) => {
    output.push(payload.toString('hex'))
    return origParse(payload)
}


socket.connect()
console.log('connecting')