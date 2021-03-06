import { tmpdir } from 'os'
import { join } from 'path'

export const PROJECT_NAME = 'typings'
export const CONFIG_FILE = `${PROJECT_NAME}.json`
export const TYPINGS_DIR = PROJECT_NAME
export const DTS_MAIN_FILE = 'main.d.ts'
export const DTS_BROWSER_FILE = 'browser.d.ts'
export const TRACKING_CODE = 'UA-40161947-2'
export const CACHE_DIR = join(tmpdir(), 'typings')
