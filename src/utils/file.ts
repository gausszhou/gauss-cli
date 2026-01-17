import fs from 'node:fs';

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