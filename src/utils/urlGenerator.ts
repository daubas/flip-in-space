import { CardData } from '../types/game';

// 使用更高效的壓縮方法
export const encodeCardData = (cardData: CardData[]): string => {
  try {
    // 進一步簡化資料結構
    const compactData = cardData.map(card => [
      card.name,
      card.image,
      card.englishName || ''
    ]);
    
    // 轉換為 JSON 字串
    const jsonString = JSON.stringify(compactData);
    
    // 使用 URL 安全的 Base64 編碼
    const encoded = btoa(unescape(encodeURIComponent(jsonString)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return encoded;
  } catch (error) {
    console.error('編碼卡片資料失敗:', error);
    throw new Error('無法生成遊戲網址');
  }
};

// 解碼卡片資料
export const decodeCardData = (encodedData: string): CardData[] => {
  try {
    // 還原 Base64 padding 和字符
    let base64 = encodedData
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // 添加必要的 padding
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonString = decodeURIComponent(escape(atob(base64)));
    const compactData = JSON.parse(jsonString);
    
    // 還原完整的資料結構
    const cardData: CardData[] = compactData.map((item: string[], index: number) => ({
      id: `url-${index}`,
      name: item[0],
      image: item[1],
      englishName: item[2] || undefined
    }));
    
    return cardData;
  } catch (error) {
    console.error('解碼卡片資料失敗:', error);
    throw new Error('無效的遊戲網址格式');
  }
};

// 生成遊戲網址
export const generateGameUrl = (cardData: CardData[]): string => {
  try {
    const encodedData = encodeCardData(cardData);
    const baseUrl = window.location.origin;
    return `${baseUrl}/game/${encodedData}`;
  } catch (error) {
    console.error('生成遊戲網址失敗:', error);
    throw new Error('無法生成遊戲網址');
  }
};

// 檢查是否為有效的編碼資料
export const isValidEncodedData = (encodedData: string): boolean => {
  try {
    const cardData = decodeCardData(encodedData);
    return Array.isArray(cardData) && cardData.length > 0;
  } catch {
    return false;
  }
};