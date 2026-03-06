import { findFiles, processEachFile } from '@/utils/file.js';

interface XSSIssue {
  filePath: string;
  line: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  code: string;
}

const XSS_PATTERNS = [
  {
    pattern: /dangerouslySetInnerHTML\s*=/,
    type: 'dangerouslySetInnerHTML',
    severity: 'high' as const,
    message: 'React 中使用 dangerouslySetInnerHTML 可能导致 XSS 攻击',
  },
  {
    pattern: /\.innerHTML\s*=/,
    type: 'innerHTML',
    severity: 'high' as const,
    message: '直接设置 innerHTML 可能导致 XSS 攻击',
  },
  {
    pattern: /document\.write\s*\(/,
    type: 'document.write',
    severity: 'high' as const,
    message: 'document.write 可能导致 XSS 攻击',
  },
  {
    pattern: /\beval\s*\(/,
    type: 'eval',
    severity: 'high' as const,
    message: 'eval() 函数可能执行恶意代码',
  },
  {
    pattern: /v-html\s*=/,
    type: 'v-html',
    severity: 'high' as const,
    message: 'Vue 中使用 v-html 可能导致 XSS 攻击',
  },
  {
    pattern: /\[innerHTML\]\s*=/,
    type: 'angular-innerHTML',
    severity: 'high' as const,
    message: 'Angular 中使用 innerHTML 可能导致 XSS 攻击',
  },
  {
    pattern: /ng-bind-html\s*=/,
    type: 'ng-bind-html',
    severity: 'high' as const,
    message: 'Angular 中使用 ng-bind-html 可能导致 XSS 攻击',
  },
  {
    pattern: /new\s+Function\s*\(/,
    type: 'new Function',
    severity: 'high' as const,
    message: 'new Function() 可能执行恶意代码',
  },
  {
    pattern: /setTimeout\s*\(\s*['"`]/,
    type: 'setTimeout-string',
    severity: 'medium' as const,
    message: 'setTimeout 使用字符串参数可能存在安全风险',
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/,
    type: 'setInterval-string',
    severity: 'medium' as const,
    message: 'setInterval 使用字符串参数可能存在安全风险',
  },
  {
    pattern: /location\.href\s*=\s*[^'"\s]+/,
    type: 'location.href',
    severity: 'medium' as const,
    message: '直接设置 location.href 可能导致开放重定向',
  },
  {
    pattern: /window\.open\s*\(\s*[^'"\s]+/,
    type: 'window.open',
    severity: 'medium' as const,
    message: 'window.open 使用未验证的 URL 可能存在安全风险',
  },
];

const USER_INPUT_PATTERNS = [
  {
    pattern: /URLSearchParams/,
    type: 'url-params',
    message: '使用 URLSearchParams 获取参数时需要进行验证和转义',
  },
  {
    pattern: /window\.location\.(search|hash)/,
    type: 'location-search-hash',
    message: '使用 location.search 或 location.hash 时需要进行验证和转义',
  },
  {
    pattern: /localStorage\.getItem/,
    type: 'localstorage',
    message: '使用 localStorage.getItem 时需要进行验证和转义',
  },
  {
    pattern: /sessionStorage\.getItem/,
    type: 'sessionstorage',
    message: '使用 sessionStorage.getItem 时需要进行验证和转义',
  },
  {
    pattern: /document\.cookie/,
    type: 'document-cookie',
    message: '使用 document.cookie 时需要注意安全性和 XSS 防护',
  },
];

export function checkXSS(pattern: string) {
  console.log('🔍 开始 XSS 安全检查...', pattern);
  
  const filePathList = findFiles(pattern);
  const issues: XSSIssue[] = [];

  if (filePathList.length === 0) {
    console.log('✅ 未找到任何文件');
    return;
  }

  processEachFile(filePathList, (filePath, content) => {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      XSS_PATTERNS.forEach(({ pattern, type, severity, message }) => {
        if (pattern.test(trimmedLine)) {
          issues.push({
            filePath,
            line: index + 1,
            type,
            severity,
            message,
            code: trimmedLine.substring(0, 100),
          });
        }
      });

      USER_INPUT_PATTERNS.forEach(({ pattern, type, message }) => {
        if (pattern.test(trimmedLine)) {
          issues.push({
            filePath,
            line: index + 1,
            type,
            severity: 'low',
            message,
            code: trimmedLine.substring(0, 100),
          });
        }
      });
    });
  });

  if (issues.length === 0) {
    console.log('✅ 未发现 XSS 安全问题');
  } else {
    console.log(`\n⚠️  发现 ${issues.length} 个潜在的安全问题:\n`);
    
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    const lowIssues = issues.filter(issue => issue.severity === 'low');

    if (highIssues.length > 0) {
      console.log('🔴 高危问题:');
      highIssues.forEach(issue => {
        console.log(`  文件: ${issue.filePath}:${issue.line}`);
        console.log(`  类型: ${issue.type}`);
        console.log(`  问题: ${issue.message}`);
        console.log(`  代码: ${issue.code}`);
        console.log('');
      });
    }

    if (mediumIssues.length > 0) {
      console.log('🟡 中危问题:');
      mediumIssues.forEach(issue => {
        console.log(`  文件: ${issue.filePath}:${issue.line}`);
        console.log(`  类型: ${issue.type}`);
        console.log(`  问题: ${issue.message}`);
        console.log(`  代码: ${issue.code}`);
        console.log('');
      });
    }

    if (lowIssues.length > 0) {
      console.log('🟢 低危问题:');
      lowIssues.forEach(issue => {
        console.log(`  文件: ${issue.filePath}:${issue.line}`);
        console.log(`  类型: ${issue.type}`);
        console.log(`  问题: ${issue.message}`);
        console.log(`  代码: ${issue.code}`);
        console.log('');
      });
    }

    console.log(`\n📊 统计: 高危 ${highIssues.length} | 中危 ${mediumIssues.length} | 低危 ${lowIssues.length}`);
  }
}
