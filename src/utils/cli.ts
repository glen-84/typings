import logUpdate = require('log-update')
import spinner = require('elegant-spinner')
import chalk = require('chalk')
import Promise = require('native-or-bluebird')
import promiseFinally from 'promise-finally'
import inquirer = require('inquirer')
import archy = require('archy')
import { DependencyTree } from '../interfaces/main'

/**
 * Options for the execution.
 */
export interface PrintOptions {
  verbose: boolean
}

/**
 * Wrap async execution with a spinner.
 */
export function loader <T> (promise: T | Promise<T>, options: PrintOptions): Promise<T> {
  let end: () => void = () => undefined

  if ((process.stdout as any).isTTY) {
    const frame = spinner()
    const update = () => logUpdate.stderr(frame())
    const interval = setInterval(update, 50)

    end = () => {
      clearInterval(interval)
      logUpdate.stderr.clear()
      logUpdate.stderr.done()
    }
  }

  return promiseFinally(Promise.resolve(promise), end)
    .catch(err => handleError(err, options))
}

/**
 * Final error handling for the CLI.
 */
export function handleError (error: Error, options: PrintOptions): any {
  console.log(chalk.red(error.toString()))

  if (options.verbose && 'stack' in error) {
    console.log((error as any).stack)
  }

  process.exit(1)
}

/**
 * Run a CLI query using inquirer.
 */
export function inquire (questions: inquirer.Questions) {
  return new Promise(resolve => {
    inquirer.prompt(questions, resolve)
  })
}

/**
 * Options for archifying the dependency tree.
 */
export interface ArchifyOptions {
  name?: string
}

/**
 * Convert a dependency tree for "archy" to render.
 */
export function archifyDependencyTree (tree: DependencyTree, options: ArchifyOptions = {}) {
  const result: archy.Tree = {
    label: options.name,
    nodes: []
  }

  function traverse (result: archy.Tree, tree: DependencyTree) {
    const { nodes } = result

    for (const name of Object.keys(tree.dependencies).sort()) {
      nodes.push(traverse(
        {
          label: name,
          nodes: []
        },
        tree.dependencies[name]
      ))
    }

    for (const name of Object.keys(tree.devDependencies).sort()) {
      nodes.push(traverse(
        {
          label: `${name} ${chalk.gray('(dev)')}`,
          nodes: []
        },
        tree.devDependencies[name]
      ))
    }

    for (const name of Object.keys(tree.ambientDependencies).sort()) {
      nodes.push(traverse(
        {
          label: `${name} ${chalk.gray('(ambient)')}`,
          nodes: []
        },
        tree.ambientDependencies[name]
      ))
    }

    for (const name of Object.keys(tree.ambientDevDependencies).sort()) {
      nodes.push(traverse(
        {
          label: `${name} ${chalk.gray('(ambient dev)')}`,
          nodes: []
        },
        tree.ambientDevDependencies[name]
      ))
    }

    return result
  }

  const archyTree = traverse(result, tree)

  // Print "no dependencies" on empty tree.
  if (archyTree.nodes.length === 0) {
    archyTree.nodes.push(chalk.gray('(No dependencies)'))
  }

  return archy(archyTree)
}
