import { z } from 'zod'

export type Bindings = {
	R2: R2Bucket
}

/** Variables can be extended */
export type Variables = {}

export interface App {
	Bindings: Bindings
	Variables: Variables
}

// pymirror Types

export type Sha256 = z.infer<typeof Sha256>
export const Sha256 = z.string().regex(/^[a-f\d]{64}$/)
export type PyMirrorDB = z.infer<typeof PyMirrorDB>
// Record of sha256 to url
export const PyMirrorDB = z.record(
	Sha256,
	z
		.string()
		.startsWith('https://')
		.refine((url) => Sha256.parse(url.split('#')[1]))
)
