# PageBrief

`PageBrief` 是一个 Chrome 扩展，用来总结当前网页内容，输出一段简短中文摘要。

## 安装

1. 打开 Chrome，进入 `chrome://extensions/`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择当前目录：`/Users/你的用户名/Documents/`

## 使用

1. 打开任意网页
2. 点击 `PageBrief` 扩展图标
3. 在“模型配置”里填写：
   - `API URL`
   - `Model ID`
   - `API Key`
4. 点击“保存配置”
5. 点击“总结当前页”

如果网页里有选中的文字，插件会优先总结选中内容。

## 配置说明

- 云端接口只支持 `HTTPS`
- 本地接口支持 `http://localhost` 和 `http://127.0.0.1`
- 兼容任意 `OpenAI-compatible` 接口
- 非本地接口需要填写 `API Key`

## Ollama 示例

- `API URL`: `http://127.0.0.1:11434/v1/chat/completions`
- `Model ID`: `llama3.2`
- `API Key`: 可留空

## 本地保存

- 点击“保存配置”后，模型配置会保存到当前浏览器本地
- 最近摘要和调试日志也会保存在当前浏览器本地

## 调试

- 插件右上角工具面板里可以查看调试日志
- 如需更详细信息，可在 `chrome://extensions/` 中打开该扩展的 `Inspect views`
