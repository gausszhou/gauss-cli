import fs from 'node:fs';
import * as glob from 'glob';

/**
 * 根据 glob 模式查找文件
 * @param pattern - glob 模式
 * @returns 匹配的文件路径数组
 */
export function findFiles(pattern: string) {
  return glob.sync(pattern, { ignore: 'node_modules/**' });
}

/**
 * 遍历文件列表，读取每个文件内容并执行回调
 * @param filePathList - 文件路径数组
 * @param callback - 回调函数，接收文件路径和内容
 */
export function processEachFile(filePathList: string[], callback: (filePath: string, content: string) => void) {
  filePathList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    callback(filePath, content);
  });
}

/**
 * 遍历文件列表，对每个文件的每一行执行回调
 * @param filePathList - 文件路径数组
 * @param callback - 回调函数，接收文件路径、行内容和行索引
 */
export function processEachLine(filePathList: string[], callback: (filePath: string, line: string, index: number) => void) {
  filePathList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      callback(filePath, line, index);
    });
  });
}