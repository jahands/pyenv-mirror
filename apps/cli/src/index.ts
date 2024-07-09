import 'zx/globals'
import { program } from '@commander-js/extra-typings'
import { syncCmd } from './cmd/sync'
import { verifyCmd } from './cmd/verify'

program.addCommand(syncCmd).addCommand(verifyCmd).parse()
