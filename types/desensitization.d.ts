import type { Plugin } from "vite";

export interface DesensitizationOptions {
  /** 
   * 脱敏规则 对象的时候就将文档中属性名转成属性值，字符数组就将里面的字符转成脱敏词, 
   * 敏感词可以使用 base64 进行编码加密。插件会识别并解码 */
  rule: { [x:string]: string, } | string[]
  /** 脱敏词，默认为 ** */
  desensitizedWord?: string,
  
}
/**
 * 脱敏
 * @param options 
 */
export function desensitization(options?: DesensitizationOptions): Plugin;

