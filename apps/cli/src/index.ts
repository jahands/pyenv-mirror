import 'zx/globals'

import { program } from '@commander-js/extra-typings'

import { buildCmd } from './cmd/build'
import { syncCmd } from './cmd/sync'
import { verifyCmd } from './cmd/verify'

program.addCommand(buildCmd).addCommand(syncCmd).addCommand(verifyCmd).parse()
