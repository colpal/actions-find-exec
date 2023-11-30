# For Each

Glob the filesystem to create `matrix` definitions for parallel jobs. This
action uses [globby](https://github.com/sindresorhus/globby) under the hood

## Usage

### Simple

```yaml
steps:
  - uses: actions/checkout@v4
  - run: tree
    # .
    # ├── function-a
    # │   └── file.txt
    # ├── function-b
    # │   └── file.txt
    # └── other-folder
    #     └── file.txt
  - id: for-each
    uses: colpal/actions-for-each@v0.1
    with:
      patterns: |
        **/file.txt
        !other-folder/*
  - run: echo ${{ steps.for-each.outputs.matches }}
    # ["function-a/file.txt","function-b/file.txt"]
```

### Static Parallel

```yaml
jobs:
  divide:
    steps:
      - uses: actions/checkout@v4
      - run: tree
        # .
        # ├── function-a
        # │   ├── main.py
        # │   └── deploy.sh
        # ├── function-b
        # │   ├── main.js
        # │   └── deploy.sh
        # └── other-folder
        #     ├── main.js
        #     └── deploy.sh
      - id: for-each
        uses: colpal/actions-for-each@v0.1
        with:
          patterns: 'function-*'
    outputs:
      # ["function-a/", "function-b/"]
      matches: ${{ steps.for-each.outputs.matches }}

  conquer:
    needs: divide
    strategy:
      matrix:
        path: ${{ fromJSON(needs.divide.outputs.matches) }}
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh
        working-directory: ${{ matrix.path }}
```

## Reference

For more details on the supported patterns, see
[here](https://github.com/sindresorhus/globby#globbing-patterns)

```yaml
steps:
  - id: for-each
    uses: colpal/actions-for-each@v0.1
    with:
      # REQUIRED (if `root-patterns` is not specified)
      # The pattern(s) to be used to find folders/files. More than one pattern
      # may be supplied by putting each on its own line.
      patterns: single-line string | multi-line string

      # OPTIONAL (only valid if `root-patterns` is specified)
      # DEFAULT = **
      # The pattern(s) to be used to find files/folders to provide to
      # `root-patterns` (see the description of `root-patterns` for more
      # details)
      filter-patterns: single-line string | multi-line string

      # REQUIRED (if `patterns` is not specified)
      # The pattern(s) to be used to "hoist" files/folders matched by
      # `filter-patterns`. The process is as follows:
      #   1. `filter-patterns` is applied to the filesystem to create a list
      #      of paths (similar to what `patterns` does when specified alone)
      #   2. `root-patterns` is then applied to the paths from the previous
      #      step. Any paths that match will be added to the `matches` output.
      #   3. `dirname` will be applied to all paths from step 2 that DID NOT
      #      match `root-patterns`, effectively removing the last segment of
      #      the path. For example:
      #        `folder-a/subfolder-a/file-a` becomes `folder-a/subfolder-a/`
      #        `folder-a/subfolder-a/`       becomes `folder-a/`
      #        `folder-a/`                   becomes `./`
      #        `./`                          becomes `./`
      #   4. Repeat steps 2 - 4 until the only unmatched paths are "./"
      #   5. `matches` is set as an output of the action
      root-patterns: single-line string | multi-line string
outputs:
  # An JSON-formatted array of paths that matched the pattern(s)
  matches: ${{ steps.for-each.outputs.matches }}
```

## Recipes

### Find all folders that contain certain files

```yaml
- uses: colpal/actions-for-each@v0.1
  with:
    root-patterns: |
      ./
      **/
    filter-patterns: |
      **/main.sh
      **/start.sh
```
