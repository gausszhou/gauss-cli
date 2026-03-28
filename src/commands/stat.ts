import { findFiles, processEachFile } from '@/utils/file.js';
import Table from 'cli-table3';

interface CodeStats {
  totalLines: number;
  totalChars: number;
  totalTokens: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  totalFunctions: number;
  languageStats: Map<string, { 
    lines: number; 
    chars: number; 
    files: number; 
    tokens: number;
    codeLines: number;
    commentLines: number;
    blankLines: number;
    functions: number;
  }>;
}

const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  JavaScript: ['.js', '.jsx', '.mjs'],
  TypeScript: ['.ts', '.tsx'],
  HTML: ['.html', '.htm'],
  CSS: ['.css', '.scss', '.sass', '.less'],
  JSON: ['.json'],
  Markdown: ['.md', '.mdx'],
  Vue: ['.vue'],
};

function getLanguage(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return language;
    }
  }
  return 'Other';
}

function estimateTokens(content: string): number {
  const trimmedContent = content.trim();
  if (!trimmedContent) return 0;

  const cjkChars = (trimmedContent.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = trimmedContent.length - cjkChars;

  return Math.round(cjkChars * 0.6 + otherChars * 0.3);
}

function detectFunctions(content: string): Array<{ name: string; lines: number }> {
  const functions: Array<{ name: string; lines: number }> = [];
  const lines = content.split('\n');
  
  const functionPatterns = [
    /function\s+(\w+)\s*\(/,
    /const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
    /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/,
    /(\w+)\s*\([^)]*\)\s*{/,
    /export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
    /export\s+(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
  ];
  
  let inFunction = false;
  let functionStartLine = 0;
  let braceCount = 0;
  let currentFunctionName = '';
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!inFunction) {
      for (const pattern of functionPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          inFunction = true;
          functionStartLine = index;
          currentFunctionName = match[1] || 'anonymous';
          braceCount = (trimmedLine.match(/{/g) || []).length - (trimmedLine.match(/}/g) || []).length;
          break;
        }
      }
    } else {
      const openBraces = (trimmedLine.match(/{/g) || []).length;
      const closeBraces = (trimmedLine.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      if (braceCount <= 0) {
        const functionLines = index - functionStartLine + 1;
        if (functionLines > 50) {
          functions.push({
            name: currentFunctionName,
            lines: functionLines,
          });
        }
        inFunction = false;
        braceCount = 0;
      }
    }
  });
  
  return functions;
}

function analyzeCodeLines(content: string): { codeLines: number; commentLines: number; blankLines: number } {
  const lines = content.split('\n');
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      blankLines++;
      continue;
    }
    
    if (inBlockComment) {
      commentLines++;
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }
    
    if (trimmed.startsWith('/*')) {
      commentLines++;
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      continue;
    }
    
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('<!--')) {
      commentLines++;
      continue;
    }
    
    if (trimmed.startsWith('*') && !trimmed.startsWith('* ')) {
      commentLines++;
      continue;
    }
    
    codeLines++;
  }

  return { codeLines, commentLines, blankLines };
}

/**
 * 统计代码行数、字符数、Token 数等信息
 * @param pattern - glob 模式，用于匹配待统计的文件
 */
export function checkCode(pattern: string) {
  const filePathList = findFiles(pattern);
  
  if (filePathList.length === 0) {
    console.log('No files found');
    return;
  }
  
  const stats: CodeStats = {
    totalLines: 0,
    totalChars: 0,
    totalTokens: 0,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    totalFunctions: 0,
    languageStats: new Map(),
  };
  
  processEachFile(filePathList, (filePath, content) => {
    const lines = content.split('\n');
    const lineCount = lines.length;
    const charCount = content.length;
    const tokenCount = estimateTokens(content);
    const language = getLanguage(filePath);
    const codeAnalysis = analyzeCodeLines(content);
    const functions = detectFunctions(content);
    
    stats.totalLines += lineCount;
    stats.totalChars += charCount;
    stats.totalTokens += tokenCount;
    stats.codeLines += codeAnalysis.codeLines;
    stats.commentLines += codeAnalysis.commentLines;
    stats.blankLines += codeAnalysis.blankLines;
    stats.totalFunctions += functions.length;
    
    const langStats = stats.languageStats.get(language) || { 
      lines: 0, 
      chars: 0, 
      files: 0, 
      tokens: 0,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0,
      functions: 0,
    };
    langStats.lines += lineCount;
    langStats.chars += charCount;
    langStats.files += 1;
    langStats.tokens += tokenCount;
    langStats.codeLines += codeAnalysis.codeLines;
    langStats.commentLines += codeAnalysis.commentLines;
    langStats.blankLines += codeAnalysis.blankLines;
    langStats.functions += functions.length;
    stats.languageStats.set(language, langStats);
  });
  
  console.log('By Language:');
  const sortedLanguages = Array.from(stats.languageStats.entries())
    .sort((a, b) => b[1].lines - a[1].lines);
  
  const languageTable = new Table({
    head: ['Language', 'Files', 'Lines', 'Code', 'Comment', 'Blank', 'Avg Lines', 'Characters', 'Tokens', 'Functions'],
    style: {
      head: [],
      border: ['grey'],
    },
  });
  
  const avgLinesAll = (stats.codeLines / filePathList.length).toFixed(1);
  languageTable.push([
    'ALL',
    filePathList.length.toString(),
    stats.totalLines.toLocaleString(),
    stats.codeLines.toLocaleString(),
    stats.commentLines.toLocaleString(),
    stats.blankLines.toLocaleString(),
    avgLinesAll,
    stats.totalChars.toLocaleString(),
    stats.totalTokens.toLocaleString(),
    stats.totalFunctions.toString(),
  ]);
  
  sortedLanguages.forEach(([language, data]) => {
    const avgLines = (data.codeLines / data.files).toFixed(1);
    languageTable.push([
      language,
      data.files.toString(),
      data.lines.toLocaleString(),
      data.codeLines.toLocaleString(),
      data.commentLines.toLocaleString(),
      data.blankLines.toLocaleString(),
      avgLines,
      data.chars.toLocaleString(),
      data.tokens.toLocaleString(),
      data.functions.toString(),
    ]);
  });
  console.log(languageTable.toString());
}
