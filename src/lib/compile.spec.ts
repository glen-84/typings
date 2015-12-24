import test = require('blue-tape')
import nock = require('nock')
import { EOL } from 'os'
import { join, relative } from 'path'
import compile from './compile'
import { DependencyTree } from '../interfaces/main'
import { PROJECT_NAME, CONFIG_FILE } from '../utils/config'
import { VERSION } from '../typings'

const FIXTURES_DIR = join(__dirname, '__test__/fixtures')

test('compile', t => {
  t.test('fixtures', t => {
    t.test('compile a normal definition', t => {
      const FIXTURE_DIR = join(FIXTURES_DIR, 'compile')

      const root: DependencyTree = {
        src: join(FIXTURE_DIR, CONFIG_FILE),
        missing: false,
        main: 'root',
        raw: undefined,
        browser: {
          b: 'browser'
        },
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      const a: DependencyTree = {
        src: join(FIXTURE_DIR, `a/${CONFIG_FILE}`),
        missing: false,
        main: undefined,
        raw: undefined,
        typings: 'typed.d.ts',
        browserTypings: 'typed.browser.d.ts',
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      const b: DependencyTree = {
        src: join(FIXTURE_DIR, 'bower.json'),
        missing: false,
        main: undefined,
        raw: undefined,
        typings: 'typings/b.d.ts',
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      const browser: DependencyTree = {
        src: join(FIXTURE_DIR, 'package.json'),
        missing: false,
        main: undefined,
        raw: undefined,
        typings: 'browser.d.ts',
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      const dep: DependencyTree = {
        src: join(FIXTURE_DIR, `dep/${CONFIG_FILE}`),
        missing: false,
        main: 'dep/main.d.ts',
        raw: undefined,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      ;(root as any).dependencies.a = a
      ;(root as any).dependencies.b = b
      ;(root as any).dependencies.dep = dep
      ;(root as any).dependencies.browser = browser

      return compile(root, { name: 'root', cwd: __dirname, ambient: false, meta: true })
        .then((result) => {
          t.equal(result.main, [
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'a/typed.d.ts'))}`,
            'declare module \'root~a\' {',
            'export interface ITest {',
            '  foo: string',
            '  bar: boolean',
            '}',
            'export default function (): ITest',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'typings/b.d.ts'))}`,
            'declare module \'root~b\' {',
            'export const foo: number',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'dep/path.d.ts'))}`,
            'declare module \'root~dep/path\' {',
            'export const isDep: boolean',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'root-import.d.ts'))}`,
            'declare module \'root/root-import\' {',
            'export const test: string',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'root.d.ts'))}`,
            'declare module \'root/root\' {',
            'import a from \'root~a\'',
            'import b = require(\'root~b\')',
            'import { isDep } from \'root~dep/path\'',
            'export * from \'root/root-import\'',
            '}',
            'declare module \'root\' {',
            'export * from \'root/root\';',
            '}'
          ].join(EOL))

          t.equal(result.browser, [
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'a/typed.browser.d.ts'))}`,
            'declare module \'root~a\' {',
            'export function browser (): boolean',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'browser.d.ts'))}`,
            'declare module \'root~b\' {',
            'export const bar: boolean',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'dep/path.d.ts'))}`,
            'declare module \'root~dep/path\' {',
            'export const isDep: boolean',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'root-import.d.ts'))}`,
            'declare module \'root/root-import\' {',
            'export const test: string',
            '}',
            '',
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, join(FIXTURE_DIR, 'root.d.ts'))}`,
            'declare module \'root/root\' {',
            'import a from \'root~a\'',
            'import b = require(\'root~b\')',
            'import { isDep } from \'root~dep/path\'',
            'export * from \'root/root-import\'',
            '}',
            'declare module \'root\' {',
            'export * from \'root/root\';',
            '}'
          ].join(EOL))
        })
    })

    t.test('compile export equals', t => {
      const FIXTURE_DIR = join(FIXTURES_DIR, 'compile-export-equals')

      const file: DependencyTree = {
        src: join(FIXTURE_DIR, CONFIG_FILE),
        missing: false,
        main: 'file.d.ts',
        raw: undefined,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      return compile(file, { name: 'foobar', cwd: __dirname, ambient: false, meta: false })
        .then(results => {
          t.equal(results.main, [
            'declare module \'foobar/file\' {',
            'function foo (value: string): foo.Bar;',
            '',
            'module foo {',
            '  export interface Bar {',
            '    (message: any, ...args: any[]): void;',
            '    enabled: boolean;',
            '    namespace: string;',
            '  }',
            '}',
            '',
            'export = foo;',
            '}',
            'declare module \'foobar\' {',
            'import main = require(\'foobar/file\');',
            'export = main;',
            '}'
          ].join(EOL))
        })
    })

    t.test('compile an ambient definition', t => {
      const FIXTURE_DIR = join(FIXTURES_DIR, 'compile-ambient')

      const node: DependencyTree = {
        src: __filename,
        raw: undefined,
        missing: false,
        typings: join(FIXTURE_DIR, 'node.d.ts'),
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      const fs: DependencyTree = {
        src: join(FIXTURE_DIR, 'fs.d.ts'),
        missing: false,
        main: undefined,
        raw: undefined,
        typings: join(FIXTURE_DIR, 'fs.d.ts'),
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      ;(node as any).dependencies.fs = fs

      return compile(node, { name: 'name', cwd: __dirname, ambient: true, meta: false })
        .then(result => {
          t.equal(result.main, [
            'declare module \'fs\' {',
            'export function readFileSync (path: string, encoding: string): string',
            'export function readFileSync (path: string): Buffer',
            '}',
            '',
            'declare var __dirname: string'
          ].join(EOL))
        })
    })

    t.test('compile inline ambient definitions', t => {
      const FIXTURE_DIR = join(FIXTURES_DIR, 'compile-inline-ambient')
      const typings = join(FIXTURE_DIR, 'node.d.ts')

      const node: DependencyTree = {
        src: __filename,
        missing: false,
        raw: undefined,
        typings,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: {},
        ambientDevDependencies: {}
      }

      return compile(node, { name: 'name', cwd: __dirname, ambient: true, meta: true })
        .then(result => {
          const contents = [
            `// Compiled using typings@${VERSION}`,
            `// Source: ${relative(__dirname, typings)}`,
            'declare const require: (module: string) => any;',
            '',
            'declare module "events" {',
            '\texport const test: boolean;',
            '}',
            '',
            'declare module "fs" {',
            '\timport * as events from "events";',
            '}'
          ].join(EOL)

          t.equal(result.main, contents)
          t.equal(result.browser, contents)
        })
    })
  })

  t.test('missing error', t => {
    const node: DependencyTree = {
      src: 'http://example.com/typings/index.d.ts',
      missing: true,
      raw: undefined,
      typings: 'http://example.com/typings/index.d.ts',
      dependencies: {},
      devDependencies: {},
      ambientDependencies: {},
      ambientDevDependencies: {}
    }

    t.plan(1)

    return compile(node, { name: 'test', cwd: __dirname, ambient: false, meta: false })
      .catch(function (result) {
        t.equal(result.message, 'Missing dependency "test", unable to compile dependency tree')
      })
  })

  t.test('no main or typings error', t => {
    const FIXTURE_DIR = join(FIXTURES_DIR, 'main-resolve-error')

    const main: DependencyTree = {
      src: join(FIXTURE_DIR, 'package.json'),
      raw: undefined,
      missing: false,
      dependencies: {},
      devDependencies: {},
      ambientDependencies: {},
      ambientDevDependencies: {}
    }

    t.plan(1)

    return compile(main, { name: 'main', cwd: __dirname, ambient: false, meta: false })
      .catch(function (error) {
        t.ok(/^Unable to resolve entry "\.d\.ts" file for "main"/.test(error.message))
      })
  })

  t.test('no module dts file error', t => {
    const FIXTURE_DIR = join(FIXTURES_DIR, 'node-resolve-error')

    const main: DependencyTree = {
      src: join(FIXTURE_DIR, 'package.json'),
      main: 'index.js',
      missing: false,
      raw: undefined,
      dependencies: {},
      devDependencies: {},
      ambientDependencies: {},
      ambientDevDependencies: {}
    }

    const dependency: DependencyTree = {
      main: 'index.js',
      raw: undefined,
      src: join(FIXTURE_DIR, 'node_modules/test/package.json'),
      missing: false,
      dependencies: {},
      devDependencies: {},
      ambientDependencies: {},
      ambientDevDependencies: {}
    }

    ;(main as any).dependencies.test = dependency

    t.plan(1)

    return compile(main, { name: 'main', cwd: __dirname, ambient: false, meta: false })
      .catch(function (error) {
        t.ok(/^Unable to read typings for "main~test"/.test(error.message))
      })
  })

  t.test('resolve over http', t => {
    const node: DependencyTree = {
      src: 'http://example.com/typings.json',
      missing: false,
      raw: undefined,
      typings: 'http://example.com/index.d.ts',
      dependencies: {},
      devDependencies: {},
      ambientDependencies: {},
      ambientDevDependencies: {}
    }

    nock('http://example.com')
      .get('/typings.json')
      .reply(200, '{"main":"index.d.ts"}')

    nock('http://example.com')
      .get('/index.d.ts')
      .reply(200, 'export const helloWorld: string')

    return compile(node, { name: 'test', cwd: __dirname, ambient: false, meta: false })
      .then(function (result) {
        t.equal(result.main, "declare module 'test' {\nexport const helloWorld: string\n}")
      })
  })
})
