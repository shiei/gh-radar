# Spec Delta

## Purpose

定义应用界面语言的可用集合、默认语言、用户切换语言的行为，以及界面文案必须来自集中的语言文件这一约束。

## ADDED Requirements

### Requirement: Supported languages

应用 SHALL 支持三种界面语言：英文（en）、日文（ja）、中文（zh）。任一时刻恰好有一种语言处于激活状态，所有用户可见文案 SHALL 以当前语言显示。

#### Scenario: English active

- **WHEN** 当前语言为英文
- **THEN** 页头、控件标签、提示文字均以英文显示

#### Scenario: Japanese active

- **WHEN** 当前语言为日文
- **THEN** 页头、控件标签、提示文字均以日文显示

#### Scenario: Chinese active

- **WHEN** 当前语言为中文
- **THEN** 页头、控件标签、提示文字均以中文显示

### Requirement: Default language is English

当浏览器本地没有保存过语言选择时，应用 SHALL 以英文作为初始语言，不根据浏览器或操作系统的语言偏好自动选择。

#### Scenario: First visit on a Japanese browser

- **WHEN** 用户首次访问且浏览器语言偏好为日文
- **THEN** 页面以英文显示

### Requirement: User can switch language

应用 SHALL 在页头提供一个始终可见的语言切换控件，列出全部支持的语言。用户选择后，界面文案 SHALL 立即切换到所选语言，不需要刷新页面。

#### Scenario: Switch to Chinese

- **WHEN** 当前语言为英文且用户在语言切换控件中选择中文
- **THEN** 所有用户可见文案立即变为中文，且控件显示当前为中文

#### Scenario: Switcher shows native language names

- **WHEN** 用户打开语言切换控件
- **THEN** 每个选项以该语言自身的名称显示（English、日本語、中文），不随当前语言变化

#### Scenario: Switcher is accessible

- **WHEN** 用户仅使用键盘操作语言切换控件
- **THEN** 可以打开、浏览并选择任一语言，且控件带有可访问名称

### Requirement: Language choice persists

用户选择的语言 SHALL 保存在该浏览器本地。用户再次打开或刷新页面时，SHALL 恢复上次选择的语言。

#### Scenario: Choice survives reload

- **WHEN** 用户将语言切换为日文，然后刷新页面
- **THEN** 页面以日文显示

### Requirement: Document language reflects active language

页面文档的语言标记 SHALL 始终与当前激活的界面语言一致，以便屏幕阅读器和浏览器按正确语言处理页面。

#### Scenario: Language switch updates document language

- **WHEN** 用户将语言从英文切换为中文
- **THEN** 文档语言标记变为中文对应的值

### Requirement: All copy comes from language files

所有用户可见文案 SHALL 来自每种语言各一份的集中语言文件，组件中 MUST NOT 出现硬编码的界面文案。三份语言文件 SHALL 拥有完全相同的键集合。

#### Scenario: Missing translation is detectable

- **WHEN** 某个键存在于英文语言文件但缺失于日文语言文件
- **THEN** 自动化检查报告该缺失，而不是在界面上静默显示键名或英文

#### Scenario: Adding copy requires all languages

- **WHEN** 开发者为某个界面新增一条文案
- **THEN** 该文案在三种语言的文件中都有对应条目
