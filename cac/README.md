# 配置即代码服务

## 特性

- 服务化
- 基于Git版本化
- 适配GitHub、Gitee、Gitea
- 大并发下串行更新代码库
- 缓存机制

## 缓存结构

### 快捷方式

#### Key

`cac_link:<path>:<ref>`

#### Value

内容的Key（cac:<blob_sha>）
或者临时内容的Key（cac:<blob_sha>）

### 内容

#### Key

`cac:<blob_sha>`
blob_sha根据内容计算获得，这样做是为了消除掉对git的blob sha的依赖
如果依赖了git的blob sha，那么在保存时，就无法快速建立缓存，需要等待git提交成功之后才可以

#### Value

Blob内容

### 文件索引

#### Key

`{cac_paths}:techci:pipeline-cac`

#### Value

文件路径的Set

## 操作实现设计

### 获取单个配置

| No ref specified   | Specified invalid ref | Specified valid ref |
|--------------------|-----------------------|---------------------|
| return HEAD config | return null (404)     | return that config  |

| #   | DO                                                                            |
|-----|-------------------------------------------------------------------------------|
| 1   | check path exists in cac_paths, if exists then get cac key from cac_link      |
| 2   | get cac key if link key exists                                                |
| 3   | get cac by cac key after (#2)                                                 |
| 4   | fallback to load from codebase if cac key not exists (#1) or cac is null (#3) |
| 5   | cache cac to cac key if loaded from codebase (#4)                             |
| 6   | cache cac link key after (#5)                                                 |
| 7   | return cac after (#6)                                                         |
| 8   | return cac after succeeded loading from cache (#3)                            |
| 9   | return null if failed loading from codebase (#4)                              |  
| 10  | return null if path not exists in cac_paths                                   |

### 获取路径下的所有配置

| #   | DO                                                                                    |
|-----|---------------------------------------------------------------------------------------|
| 1   | scan {cac_paths} for filenames match the path as prefix                               |
| 2   | for each filename get single config with ref is HEAD, the processes are same as above |
| 3   | assemble the configs into a list and return                                           |
| 4   | if path doesn't exist return an empty list                                            |

### 保存配置

| #   | DO                                                                                  |
|-----|-------------------------------------------------------------------------------------|
| 1   | push the save action into queue                                                     |
| 2   | each cac service node bids that message                                             |
| 3   | the node wins this bidding will lock the queue until it commit the message into git |
| 4   | at the same time as (#1), generate the cac key via generating SHA256 of the config  |
| 5   | save the config into cac key after (#4)                                             |
| 6   | link the HEAD cac_link key to the cac key after (#5)                                |
| 7   | add the path into cac_paths after (#6)                                              |

### 删除配置

| #   | DO                                                      |
|-----|---------------------------------------------------------|
| 1   | remove the path from cac_paths                          |
| 2   | push the delete action into queue                       |
| 3   | bidding & commit to git same as save                    |
