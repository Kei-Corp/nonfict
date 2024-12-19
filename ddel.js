const Redis = require('ioredis');
const redis = new Redis(); // Redis接続

redis.lrem("users", 0, "aaa")

const deduplicateList = async (listKey) => {
  try {
    // LISTの全データ取得
    const listData = await redis.lrange(listKey, 0, -1);

    // 重複要素を削除 (Setを使用)
    const uniqueData = [...new Set(listData)];

    // 元のLISTを削除し、重複のないデータを再セット
    await redis.del(listKey);
    if (uniqueData.length > 0) {
      await redis.rpush(listKey, ...uniqueData);
    }

    console.log(`List "${listKey}" was deduplicated successfully.`);
  } catch (err) {
    console.error('Error deduplicating list:', err);
  } finally {
    redis.quit();
  }
};
deduplicateList('users');
