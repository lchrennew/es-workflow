# TargetRequest postResponseScript 示例

postResponseScript 在收到目标系统响应后执行,用于回调通知、日志记录等。

## 响应日志记录

```javascript
console.log('Response received:', content);
console.log('Status:', content.response?.status);
console.log('Data:', content.response?.data);
```

## 失败回调

```javascript
if (!content.response?.ok) {
  console.error('Request failed:', content.response?.status);
  
  await api('https://alert.example.com/webhook', {
    method: 'POST',
    body: {
      message: 'Request failed',
      targetRequest: content.request,
      response: content.response,
      timestamp: dayjs().format()
    }
  });
}
```

## 成功通知

```javascript
if (content.response?.ok) {
  console.log('Request succeeded');
  
  await api('https://callback.example.com/success', {
    method: 'POST',
    body: {
      id: content.response.data?.id,
      timestamp: dayjs().format()
    }
  });
}
```

## 数据提取和存储

```javascript
const responseData = content.response?.data;

if (responseData && responseData.id) {
  await api('https://storage.example.com/save', {
    method: 'POST',
    body: {
      request_id: content.request.id,
      response_id: responseData.id,
      status: content.response.status,
      timestamp: dayjs().unix()
    }
  });
}
```

## 条件后续处理

```javascript
if (content.response?.ok) {
  const data = content.response.data;
  
  if (data.status === 'pending') {
    await api('https://workflow.example.com/poll', {
      method: 'POST',
      body: {
        id: data.id,
        poll_url: data.poll_url
      }
    });
  }
}
```
