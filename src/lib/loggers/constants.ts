import { Log } from './models'

export const libs = Log.root.extends('libs')
export const analytic = libs.extends('analytic')
export const component = libs.extends('component')
export const database = libs.extends('database')
export const formatter = libs.extends('formatter')
export const theme = libs.extends('theme')
export const transaction = libs.extends('transaction')

export const utils = Log.root.extends('utils')
export const db = utils.extends('db')
export const store = utils.extends('store')

export const components = Log.root.extends('components')

export const pages = Log.root.extends('pages')
