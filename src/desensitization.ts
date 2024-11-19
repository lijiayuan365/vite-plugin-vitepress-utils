import type { Plugin } from 'vite';
import { DesensitizationOptions } from '../types/index';
import { isBase64 } from './utils';


/**
 * 文档关键词脱敏
 * @param options 
 * @returns 
 */
export function desensitization(options: DesensitizationOptions): Plugin {
  return {
    name: 'vite-plugin-vitepress-utils',
    apply: 'build',
    transform(code) {
      const { desensitizedWord = '**' } = options;
      try {
        // 在构建时执行的方法
        if (Array.isArray(options.rule)) {
          // 如果传入的是字符数组，将文档中字符数组的对应的文本转成**
          options.rule.forEach((item: string) => {
            const itemWord = isBase64(item)
              ? Buffer.from(item, 'base64').toString()
              : item;
            code = code.replace(new RegExp(itemWord, 'g'), desensitizedWord);
          });
        } else {
          // 如果传入的是对象，将对象属性名对应的文本转成对应的属性值文本
          Object.keys(options.rule).forEach((key) => {
            const rule = options.rule as { [x: string]: string };
            const itemWord = isBase64(key)
              ? Buffer.from(key, 'base64').toString()
              : key;
            code = code.replace(new RegExp(itemWord, 'g'), rule[key]);
          });
        }

        return {
          code: code,
          map: null,
        };
      } catch (error) {
        console.log('Error', error);
      }
    },
  };
}