import { findFiles, processEachFile } from '@/utils/file.js';

interface CodeStats {
  totalLines: number;
  totalChars: number;
  totalTokens: number;
  largeFiles: Array<{ path: string; lines: number }>;
  largeFunctions: Array<{ path: string; name: string; lines: number }>;
  languageStats: Map<string, { lines: number; chars: number; files: number }>;
}

const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  JavaScript: ['.js', '.jsx', '.mjs'],
  TypeScript: ['.ts', '.tsx'],
  HTML: ['.html', '.htm'],
  CSS: ['.css', '.scss', '.sass', '.less'],
  JSON: ['.json'],
  Markdown: ['.md', '.mdx'],
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
  
  const words = trimmedContent.split(/\s+/).filter(word => word.length > 0);
  const operators = trimmedContent.match(/[+\-*/%=<>!&|^~?:;,{}()[\]]/g) || [];
  const identifiers = trimmedContent.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
  
  return Math.max(words.length, Math.floor((operators.length + identifiers.length) * 0.8));
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

export function checkCode(pattern: string) {
  console.log('📊 开始代码统计...', pattern);
  
  const filePathList = findFiles(pattern);
  
  if (filePathList.length === 0) {
    console.log('✅ 未找到任何文件');
    return;
  }
  
  const stats: CodeStats = {
    totalLines: 0,
    totalChars: 0,
    totalTokens: 0,
    largeFiles: [],
    largeFunctions: [],
    languageStats: new Map(),
  };
  
  processEachFile(filePathList, (filePath, content) => {
    const lines = content.split('\n');
    const lineCount = lines.length;
    const charCount = content.length;
    const tokenCount = estimateTokens(content);
    const language = getLanguage(filePath);
    
    stats.totalLines += lineCount;
    stats.totalChars += charCount;
    stats.totalTokens += tokenCount;
    
    if (lineCount > 1000) {
      stats.largeFiles.push({
        path: filePath,
        lines: lineCount,
      });
    }
    
    const functions = detectFunctions(content);
    functions.forEach(func => {
      stats.largeFunctions.push({
        path: filePath,
        name: func.name,
        lines: func.lines,
      });
    });
    
    const langStats = stats.languageStats.get(language) || { lines: 0, chars: 0, files: 0 };
    langStats.lines += lineCount;
    langStats.chars += charCount;
    langStats.files += 1;
    stats.languageStats.set(language, langStats);
  });
  
  console.log('\n📈 代码统计结果\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 总文件数: ${filePathList.length}`);
  console.log(`📝 总行数: ${stats.totalLines.toLocaleString()}`);
  console.log(`🔤 总字符数: ${stats.totalChars.toLocaleString()}`);
  console.log(`🎯 估算 Token 数: ${stats.totalTokens.toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🌍 按语言统计:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const sortedLanguages = Array.from(stats.languageStats.entries())
    .sort((a, b) => b[1].lines - a[1].lines);
  
  sortedLanguages.forEach(([language, data]) => {
    const percentage = ((data.lines / stats.totalLines) * 100).toFixed(1);
    console.log(`  ${language}:`);
    console.log(`    文件数: ${data.files}`);
    console.log(`    行数: ${data.lines.toLocaleString()} (${percentage}%)`);
    console.log(`    字符数: ${data.chars.toLocaleString()}`);
  });
  
  if (stats.largeFiles.length > 0) {
    console.log('\n⚠️  超大文件 (>1000 行):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    stats.largeFiles.forEach(file => {
      console.log(`  📁 ${file.path}`);
      console.log(`     行数: ${file.lines.toLocaleString()}`);
    });
  }
  
  if (stats.largeFunctions.length > 0) {
    console.log('\n⚠️  大函数 (>50 行):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    stats.largeFunctions.forEach(func => {
      console.log(`  🔧 ${func.name}()`);
      console.log(`     文件: ${func.path}`);
      console.log(`     行数: ${func.lines}`);
    });
  }
  
  console.log('\n✅ 统计完成');
}
