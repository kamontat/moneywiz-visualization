import { Log } from './models'

export const csv = Log.root.extends('csv')
export const transaction = Log.root.extends('transaction')
export const localStorage = Log.root.extends('localStorage')
export const store = Log.root.extends('store')

export const component = Log.root.extends('component')
export const page = Log.root.extends('page')
