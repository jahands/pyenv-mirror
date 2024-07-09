import 'zx/globals'
import { program } from '@commander-js/extra-typings'
import { syncCmd } from './cmd/sync'
import { verifyCmd } from './cmd/verify'
import { buildCmd } from './cmd/build'

program.addCommand(buildCmd).addCommand(syncCmd).addCommand(verifyCmd).parse()
