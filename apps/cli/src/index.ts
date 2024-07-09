import 'zx/globals'
import { program } from '@commander-js/extra-typings'
import { syncCmd } from './cmd/sync'

program.addCommand(syncCmd).parse()
