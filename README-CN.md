# vite-plugin-vitepress-utils

vitepress 系列工具。目前有下面几个功能

方法名| 功能名称 | 描述 |
| -------- | ---- | ---- |
| desensitization | 文档关键词脱敏 | 在打包时将文档中的关键词替换为指定文本 |
|autoSidebar | 自动生成侧边栏 | 构建时根据文件结构自动生成 VitePress 的侧边栏 |
...|...|...

## 使用说明

### 安装

```sh
# 推荐使用 pnpm
pnpm i vite-plugin-vitepress-utils -D

# 或者使用 npm
npm i vite-plugin-vitepress-utils -D
```

### 配置

在你的 VitePress 配置文件中（通常是 `.vitepress/config.mts` 或 `.vitepress/config.ts`），引入并配置插件：

```ts
// .vitepress/config.mts
import { autoSidebar } from 'vite-plugin-vitepress-utils'

export default defineConfig({
  vite: {
    plugins: [
      autoSidebar({
        // 在这里可以添加自定义配置，具体选项见下文
      }),
      desensitization({
        // 在这里可以添加自定义配置，具体选项见下文
      })
      // ...
    ],
  },
});
```

需要注意的是，`autoSidebar` 插件需要自己手动配置 `nav` 配置项作为入口。

## 配置项

### desensitization

| 参数名 | 类型 | 默认值 | 描述 |
| -------- | ---- | ---- | ---- |
| rule | { [x: string]: string } / string[] | 无 | 脱敏规则，可以是对象或字符串数组。对象时将属性名替换为属性值，字符串数组时将数组中的字符替换为脱敏词。 |
| desensitizedWord | string | '**' | 用于替换敏感词的文本，默认为 '**'。 |


### autoSidebar

| 参数名 | 类型 | 默认值 | 描述 |
| -------- | ---- | ---- | ---- |
| includeDirs | string[] | [] | 指定需要包含的目录。 |
| excludeDirs | string[] | [] | 指定需要排除的目录。 |
| includeFiles | string[] | [] | 指定需要包含的文件。 |
| excludeFiles | string[] | [] | 指定需要排除的文件。 |
| useMarkdownTitle | boolean | false | 是否读取 markdown 文件中的一级标题作为 sidebar 的标题。 |




