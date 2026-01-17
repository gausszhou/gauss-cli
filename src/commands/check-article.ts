import { findFiles, processEachFile } from '@/utils/file.js';

export function checkArticle(pattern: string) {
  console.log('检查文章是否符合规范', pattern);
  const filePathList = findFiles(pattern);
  processEachFile(filePathList, (filePath, content) => {
    const lines = content.split('\n');
    if (filePath.endsWith('README.md')) {
      return;
    }
    if (lines.length < 3) {
      console.log('文章内容不足3行', filePath);
      return;
    }
    if (lines.length > 500) {
      console.log('文章内容超过500行', filePath);
      return;
    }
  });
}

