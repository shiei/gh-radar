# Spec Delta

## MODIFIED Requirements

### Requirement: Per-repository fields
每条记录 SHALL 包含：`owner/name`、star 数、fork 数、未关闭 issue 数、最近推送时间、创建时间、主语言、topics、是否归档、来源列表，以及 owner 的数字 id（用于直接拼出头像地址，省去一次重定向；API 未提供时可缺省）。

#### Scenario: Record shape
- **WHEN** 读取 `latest.json` 中任一仓库
- **THEN** 上述字段齐全，缺失的语言或 topics 以 null 或空数组表示，owner id 缺失时该字段不存在
