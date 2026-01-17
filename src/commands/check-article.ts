import * as glob from 'glob';
import { processEachFile } from '../utils/file';

export function checkArticle(pattern: string) {
  console.log('检查文章是否符合规范', pattern);
  const filePathList = glob.sync(pattern);
  processEachFile(filePathList, (filePath, content) => {
    console.log(filePath, content);
  });
}

