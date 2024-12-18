import { Plugin } from "vite";
import { existsSync, promises as fs } from "fs";
import path from 'path';
import { SidebarItem, SidebarOptions } from "../types";
import type { DefaultTheme, SiteConfig } from 'vitepress';
import { awaitTo, getMdTitle, mdWatcher, throttle, unionArrays } from "./utils";

interface UserConfig {
  vitepress: SiteConfig<DefaultTheme.Config>;
}

const DEFAULT_EXCLUDE_DIRS = ['.vitepress'];
/** 文档项目的根路径 */
let ROOT_PATH = '';
/** 指定生成 sidebar 的目录和文件 */
let includes: string[] = [];
/** 排除掉 生成 sidebar的 目录与文件 */
let excludes: string[] = [];

/**
 * 构建侧边栏节点
 * @param fileName 文件或目录的名称
 * @param titleName 文件或目录的标题
 * @param isDirectory 是否为目录
 * @param filePath 文件或目录的完整路径
 * @returns 返回一个表示节点的 SidebarItem 对象
 */
function buildNode(fileName: string, titleName: string = '', isDirectory: boolean, filePath: string): SidebarItem {
  // 创建一个基础的 SidebarItem 对象，设置显示文本
  const item: SidebarItem = { text: fileName };
  item.text = titleName || fileName;
  item.fileName = fileName;

  if (isDirectory) {
    // 如果是目录，设置折叠状态并初始化空的子项数组
    item.collapsed = true,
    item.items = [];
  } else {
    // 如果是文件，设置链接属性为相对于 ROOT_PATH 的路径
    item.link = `/${path.relative(ROOT_PATH, filePath)}`
  }

  return item;
}

/**
 * 递归遍历目录
 * @param parentPath 父目录
 * @param options 插件配置
 * @returns 
 */
async function buildTree(parentPath: string, options: SidebarOptions): Promise<SidebarItem | void> {
  const result = buildNode(path.basename(parentPath), '', true, parentPath);
  const [err, files] = await awaitTo(fs.readdir(parentPath));
  if (err) return console.log(`Error`, err);

  // 创建两个数组分别存储文件和目录
  const fileItems: SidebarItem[] = [];
  const dirItems: Promise<SidebarItem | void>[] = [];
  
  for (const item of files) {
    if (excludes.includes(item)) continue;
    if (includes.length && !includes.includes(item)) continue;
    
    const filePath = path.join(parentPath, item);
    const [e, stats] = await awaitTo(fs.lstat(filePath));
    if (e) return console.log(`err, ${e}`);

    if (stats.isDirectory()) {
      dirItems.push(buildTree(filePath, options));
    } else {
      if (!filePath.endsWith('.md')) continue;
      let fileName = path.basename(filePath, '.md');
      let titleName = fileName
      if (options.useMarkdownTitle) {
        const [err, title] = await awaitTo(getMdTitle(filePath));
        if (!err && title) {
          titleName = title;
        }
      }
      const node = buildNode(fileName, titleName, false, filePath);
      fileItems.push(node);
    }
  }

  // 处理所有目录项
  const resolvedDirItems = await Promise.all(dirItems);
  const validDirItems = resolvedDirItems.filter((item): item is SidebarItem => !!item);

  // 对文件项进行排序，将 index.md 和 readme.md 置顶
  fileItems.sort((a, b) => {
    const aName = a.fileName?.toLowerCase() || '';
    const bName = b.fileName?.toLowerCase() || '';
    
    // 检查是否为 index 或 readme
    const isASpecial = aName === 'index' || aName === 'readme';
    const isBSpecial = bName === 'index' || bName === 'readme';
    
    if (isASpecial && !isBSpecial) return -1;
    if (!isASpecial && isBSpecial) return 1;
    return aName.localeCompare(bName);
  });

  // 合并排序后的文件和目录
  result.items = [...fileItems, ...validDirItems];
  return result;
}
/**
 * 构建 VitePress 的侧边栏结构
 * @param rootPath - 文档的根路径
 * @param options - 侧边栏生成的配置选项
 * @returns 返回一个 Promise，解析为侧边栏项目的记录对象或 void
 */
async function buildSidebar(
  rootPath: string | undefined,
  options: SidebarOptions
): Promise<Record<string, SidebarItem[]> | void> {
  // 如果没有提供根路径，返回空对象
  if (!rootPath) return {};
  
  // 设置全局 ROOT_PATH
  ROOT_PATH = rootPath;
  
  // 初始化结果对象，用于存储侧边栏项目
  const result: Record<string, SidebarItem[]> = {};

  // 提取配置选项
  const {
    excludeDirs = [],
    excludeFiles = [],
    includeDirs = [],
    includeFiles = [],
  } = options;

  // 合并默认和用户指定的排除项
  excludes = unionArrays(DEFAULT_EXCLUDE_DIRS, [
    ...excludeDirs,
    ...excludeFiles,
  ]);

  // 合并用户指定的包含项
  includes = unionArrays(includeDirs, includeFiles);

  // 读取根目录的内容
  const [err, files] = await awaitTo(fs.readdir(rootPath));
  if (err) return console.log(`错误`, err);

  // 遍历根目录中的每个项目
  for (const item of files) {
    // 跳过被排除的项目
    if (excludes.includes(item)) continue;
    // 如果指定了包含项，则跳过未明确包含的项目
    if (includes.length && !includes.includes(item)) continue;

    const filePath = path.join(rootPath, item);
    
    // 获取文件/目录的统计信息
    const [e, stats] = await awaitTo(fs.lstat(filePath));
    if (e) return console.log(`错误`, err);

    // 只处理根路径中的目录
    if (stats.isDirectory()) {
      // 为目录构建侧边栏树
      const [e2, sidebarItem] = await awaitTo(buildTree(filePath, options))
      if (e2) return console.log('错误', e2);
      if (!sidebarItem) return console.log('侧边栏生成失败');

      // 将侧边栏项目添加到结果对象中
      result[`/${sidebarItem.text}/`] = sidebarItem.items || [];
    }
  }

  return result;
}


/**
 * 自动生成 VitePress 侧边栏的 Vite 插件
 * @param options 侧边栏生成的配置选项
 * @returns Vite 插件对象
 */
export function autoSidebar(options: SidebarOptions = {}): Plugin {
  return {
    name: 'vite-plugin-vitepress-utils-autoSidebar',
    // md 文件增删或配置修改时，通过触发配置文件修改操作，实现刷新
    async configureServer({ config, watcher }) {
      const {
        vitepress: { configPath },
      } = config as unknown as UserConfig;
      // // 添加 1500ms 的节流，避免同时保存多个文件时重复触发刷新
      watcher.on('all', throttle(mdWatcher.bind(null, configPath), 3000));
    },
    async config(config) {
      const {
        root,
        cacheDir
      } = config;
      console.log('sidebar 生成中...');
      const [err, sidebar] = await awaitTo(buildSidebar(root, options));
      if (err) return console.log('err', err);
      if (!sidebar) return console.log('sidebar 生成失败', err);
      console.log('sidebar 结束');
      (config as unknown as UserConfig).vitepress.site.themeConfig.sidebar = sidebar;

      if (cacheDir && !existsSync(cacheDir)) {
        await fs.mkdir(cacheDir)
      }
    },
  };
}