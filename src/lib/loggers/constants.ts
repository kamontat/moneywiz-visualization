import { Log } from './models'

export const lib = Log.root.extends('lib')
export const csv = lib.extends('csv')
export const transaction = lib.extends('transaction')
export const storage = lib.extends('storage')
export const store = lib.extends('store')
export const analytics = lib.extends('analytics')

export const component = Log.root.extends('component')
export const page = Log.root.extends('page')
