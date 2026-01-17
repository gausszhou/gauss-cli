import fs from 'node:fs';
import * as glob from 'glob';

export function findFiles(pattern: string) {
  return glob.sync(pattern, { ignore: 'node_modules/**' });
}

export function processEachFile(filePathList: string[], callback: (filePath: string, content: string) => void) {
  filePathList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    callback(filePath, content);
  });
}

export function processEachLine(filePathList: string[], callback: (filePath: string, line: string, index: number) => void) {
  filePathList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      callback(filePath, line, index);
    });
  });
}