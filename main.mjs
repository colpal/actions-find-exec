#!/usr/bin/env node
import * as core from '@actions/core';
import { globby } from 'globby';

const patterns = core.getMultilineInput('patterns', { required: true });
const paths = await globby(patterns, {
  expandDirectories: false,
  gitignore: true,
  markDirectories: true,
  onlyFiles: false,
});
console.log({ paths, patterns });