% 拼接HTML和JS文件为单个网页
htmlFile = 'stopwatch.html';
jsFolder = '.'; % JS文件所在目录
outputFile = 'stopwatch_combined.html';

% 读取HTML内容
htmlText = fileread(htmlFile);

% 查找所有的script引用
jsPattern = '<script[^>]+src="([^"]+\.js)"[^>]*></script>';
tokens = regexp(htmlText, jsPattern, 'tokens');

% 替换script引用为内联JS代码
for i = 1:length(tokens)
    jsFilePath = fullfile(jsFolder, tokens{i}{1});
    if exist(jsFilePath, 'file')
        jsCode = fileread(jsFilePath);
        replacement = sprintf('<script>\n%s\n</script>', jsCode);
        htmlText = strrep(htmlText, ...
            sprintf('<script defer src="%s"></script>', tokens{i}{1}), ...
            replacement);
    else
        warning('未找到JS文件: %s', jsFilePath);
    end
end

% 安全地写出新的HTML文件
[fid, errmsg] = fopen(outputFile, 'w', 'n', 'UTF-8');
if fid == -1
    error('文件无法打开: %s', errmsg);
end
fwrite(fid, htmlText, 'char');
fclose(fid);

fprintf('✅ 文件合并完成: %s\n', outputFile);