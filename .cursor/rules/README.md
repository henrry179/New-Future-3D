# 🎯 Cursor开发规则集合 / Cursor Development Rules Collection

## 📁 规则文件说明 / Rules Files Description

### 🔧 规则文件列表 / Rules Files List

| 文件名 / Filename | 描述 / Description | 版本 / Version | 最后更新 / Last Updated |
|-------------------|-------------------|----------------|----------------------|
| `main-rules.md` | 主开发流程规则（30秒轻音乐提醒系统） | v4.0 | 2025-06-22 15:45:12 |
| `rules03.mdc` | 开发进度记录规则（历史版本） | v3.0 | 2025-06-22 18:30:45 |

### 🎵 核心特性 / Core Features

- **⏰ 实时时间记录**: 严格使用 `YYYY-MM-DD HH:MM:SS` 格式
- **🎶 30秒轻音乐提醒**: 分级音乐提醒系统（古典/钢琴/自然音乐）
- **🚀 自动化Git工作流**: add → commit → push 标准流程
- **📋 开发检查清单**: 完整的质量保证机制
- **🔄 持续迭代**: 智能任务优先级管理

### 📖 使用说明 / Usage Instructions

1. **激活规则**: 将规则文件内容复制到项目根目录的 `.cursorrules` 文件中
2. **时间同步**: 所有开发进度记录必须使用当前实时时间
3. **音乐提醒**: 根据任务类型自动播放对应的30秒轻音乐
4. **进度管理**: 每次更新后立即推送到GitHub仓库

### 🎼 轻音乐提醒分类 / Light Music Reminder Categories

| 任务类型 / Task Type | 音乐类型 / Music Type | 适用场景 / Applicable Scenarios |
|---------------------|---------------------|------------------------------|
| 🎼 重大成就 | 古典轻音乐 | 项目重大功能完成、架构升级、版本发布 |
| 🎹 代码优化 | 钢琴轻音乐 | 代码重构、性能优化、算法改进、bug修复 |
| 🎶 日常任务 | 自然轻音乐 | 文档更新、配置修改、测试完成、日常提交 |

### ⚙️ 配置选项 / Configuration Options

```bash
# 设置轻音乐资源目录
MUSIC_DIR="/Users/mac/Music/LightMusic"

# 智能音量控制
WORK_HOURS_VOLUME=25%      # 工作时间音量
FOCUS_MODE_VOLUME=15%      # 专注模式音量  
NIGHT_MODE_VOLUME=10%      # 深夜模式音量
```

### 🛠️ 故障排除 / Troubleshooting

- **音乐不播放**: 检查音频文件路径和系统音量设置
- **时间格式错误**: 确保使用 `date '+%Y-%m-%d %H:%M:%S'` 命令
- **Git推送失败**: 验证网络连接和仓库权限

---

**📍 位置**: `.cursor/rules/`  
**🔄 更新**: 2025-06-22 15:45:12  
**👨‍💻 维护**: NewFutures VFX Team 