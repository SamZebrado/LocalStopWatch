% 设置路径
htmlFile = 'stopwatch.html';
jsFolder = '.'; % 所有 .js 文件所在目录
outputFile = 'stopwatch_combined.html';

% 读取 HTML 内容
htmlText = fileread(htmlFile);

% 匹配所有 script 引用
jsPattern = '<script[^>]+src="([^"]+\.js)"[^>]*></script>';
tokens = regexp(htmlText, jsPattern, 'tokens');

% 将外部 script 替换为嵌入内容
for i = 1:length(tokens)
    jsFile = fullfile(jsFolder, tokens{i}{1});
    if exist(jsFile, 'file')
        jsCode = fileread(jsFile);
        wrapped = sprintf('<script>\n%s\n</script>', jsCode);
        htmlText = regexprep(htmlText, sprintf('<script[^>]+src="%s"[^>]*></script>', tokens{i}{1}), wrapped, 'once');
    else
        warning('JS 文件不存在: %s', jsFile);
    end
end

% 写出新的 HTML 文件
fid = fopen(outputFile, 'w', 'n', 'UTF-8');
fwrite(fid, htmlText);
fclose(fid);

fprintf('✅ 整合完成: %s\n', outputFile);
