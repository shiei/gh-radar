# Spec Delta

## MODIFIED Requirements

### Requirement: Initial appearance follows system preference
当浏览器本地没有保存过外观选择时，应用 SHALL 以夜间作为初始外观，不参考操作系统的配色偏好。这是 2026-10-21 的决定：站点以夜间为品牌默认，系统偏好不再作为依据。

#### Scenario: First visit on a dark-preferring system
- **WHEN** 用户首次访问且操作系统偏好为深色
- **THEN** 页面以夜间外观加载

#### Scenario: First visit on a light-preferring system
- **WHEN** 用户首次访问且操作系统偏好为浅色或未知
- **THEN** 页面仍以夜间外观加载

#### Scenario: Stored choice overrides system preference
- **WHEN** 浏览器本地已保存"日间"
- **THEN** 页面以日间外观加载
