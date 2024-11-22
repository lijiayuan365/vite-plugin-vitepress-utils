# vite-plugin-vitepress-utils

vitepress series tools. Currently has the following functions

Method Name | Function Name | Description |
| -------- | ---- | ---- |
| desensitization | Document Keyword Desensitization | Replace keywords in the document with specified text during packaging |
| autoSidebar | Automatically Generate Sidebar | Automatically generate VitePress sidebar based on file structure during build |
...|...|...

## Usage Instructions

### Installation

```sh
# It is recommended to use pnpm
pnpm i vite-plugin-vitepress-utils -D

# Or use npm
npm i vite-plugin-vitepress-utils -D
```

### Configuration

In your VitePress configuration file (usually `.vitepress/config.mts` or `.vitepress/config.ts`), import and configure the plugin:

```ts
// .vitepress/config.mts
import { autoSidebar } from 'vite-plugin-vitepress-utils'

export default defineConfig({
  vite: {
    plugins: [
      autoSidebar({
        // You can add custom configurations here, see options below
      }),
      desensitization({
        // You can add custom configurations here, see options below
      })
      // ...
    ],
  },
});
```

Note that the `autoSidebar` plugin requires you to manually configure the `nav` configuration item as an entry.

## Configuration Options

### desensitization

| Parameter Name | Type | Default Value | Description |
| -------- | ---- | ---- | ---- |
| rule | { [x: string]: string } / string[] | None | Desensitization rules, can be an object or an array of strings. When it's an object, the property names are replaced with property values; when it's an array of strings, the characters in the array are replaced with desensitized words. |
| desensitizedWord | string | '**' | The text used to replace sensitive words, default is '**'. |


### autoSidebar

| Parameter Name | Type | Default Value | Description |
| -------- | ---- | ---- | ---- |
| includeDirs | string[] | [] | Specify directories to include. |
| excludeDirs | string[] | [] | Specify directories to exclude. |
| includeFiles | string[] | [] | Specify files to include. |
| excludeFiles | string[] | [] | Specify files to exclude. |
| useMarkdownTitle | boolean | false | Whether to read the first-level title in the markdown file as the title of the sidebar. |
