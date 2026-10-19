# ui-theme Specification

## Purpose

定义应用的日间与夜间两套外观，以及用户如何切换外观、切换结果如何在浏览器中保持。所有界面元素都遵循当前外观。

## Requirements

### Requirement: Two appearance modes

应用 SHALL 提供两种外观：日间（light）和夜间（dark）。任一时刻恰好有一种外观处于激活状态，所有可见界面元素（背景、文字、边框、控件）SHALL 跟随当前激活的外观。

#### Scenario: Light mode renders light palette

- **WHEN** 当前外观为日间
- **THEN** 页面使用浅色背景与深色文字，且所有界面元素的颜色来自日间色板

#### Scenario: Dark mode renders dark palette

- **WHEN** 当前外观为夜间
- **THEN** 页面使用深色背景与浅色文字，且所有界面元素的颜色来自夜间色板

### Requirement: User can toggle appearance

应用 SHALL 在页头提供一个始终可见的外观切换控件。用户操作该控件时，外观 SHALL 立即在日间与夜间之间切换，不需要刷新页面。

#### Scenario: Toggle from light to dark

- **WHEN** 当前外观为日间且用户操作外观切换控件
- **THEN** 外观立即变为夜间，且控件状态反映当前为夜间

#### Scenario: Toggle from dark to light

- **WHEN** 当前外观为夜间且用户操作外观切换控件
- **THEN** 外观立即变为日间，且控件状态反映当前为日间

#### Scenario: Toggle is accessible

- **WHEN** 用户通过键盘聚焦外观切换控件并按下 Enter 或 Space
- **THEN** 外观切换，且控件带有描述当前状态的可访问名称

### Requirement: Appearance choice persists

用户手动选择的外观 SHALL 保存在该浏览器本地。用户再次打开或刷新页面时，SHALL 恢复上次选择的外观。

#### Scenario: Choice survives reload

- **WHEN** 用户将外观切换为夜间，然后刷新页面
- **THEN** 页面以夜间外观加载

#### Scenario: Choice survives new session

- **WHEN** 用户将外观切换为夜间，关闭标签页，之后在同一浏览器重新打开应用
- **THEN** 页面以夜间外观加载

### Requirement: Initial appearance follows system preference

当浏览器本地没有保存过外观选择时，应用 SHALL 以操作系统的配色偏好作为初始外观；无法获取系统偏好时默认为日间。

#### Scenario: First visit on a dark-preferring system

- **WHEN** 用户首次访问且操作系统偏好为深色
- **THEN** 页面以夜间外观加载

#### Scenario: First visit on a light-preferring system

- **WHEN** 用户首次访问且操作系统偏好为浅色或未知
- **THEN** 页面以日间外观加载

#### Scenario: Stored choice overrides system preference

- **WHEN** 浏览器本地已保存"日间"且操作系统偏好为深色
- **THEN** 页面以日间外观加载

### Requirement: No flash of wrong appearance on load

页面加载时 SHALL 在首次绘制之前就应用正确的外观，用户 MUST NOT 看到先以一种外观渲染再切换到另一种外观的闪烁。

#### Scenario: Reload in dark mode shows no light flash

- **WHEN** 已保存夜间外观的用户刷新页面
- **THEN** 从首帧开始页面即为夜间外观
