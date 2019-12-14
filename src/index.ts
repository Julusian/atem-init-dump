import { writeFileSync } from 'fs'
import { AtemSocket } from 'atem-connection/dist/lib/atemSocket'

const socket = new AtemSocket({
    debug: false,
    log: console.log,
    disableMultithreaded: true,
    address: '10.42.13.99',
    port: 9910
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
        writeFileSync('output.json', output.join('\n'))
        process.exit(0)
    }
})

const origParse = ((socket as any)._parseCommands).bind(socket)
;(socket as any)._parseCommands = (payload: Buffer) => {
    output.push(payload.toString('hex'))
    return origParse(payload)
}


socket.connect('10.42.13.99')
console.log('connecting')