import { CardData } from '../types/game';

// 從各種 Google Sheets URL 格式中提取 sheet ID 和 gid
const extractSheetInfo = (input: string): { sheetId: string; gid?: string } => {
  // 如果只是 ID，直接返回
  if (!input.includes('/') && !input.includes('http')) {
    return { sheetId: input };
  }

  // 處理各種 Google Sheets URL 格式
  const sheetIdMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = input.match(/[#&]gid=([0-9]+)/);
  
  if (!sheetIdMatch) {
    throw new Error('無法識別的 Google Sheets 連結格式');
  }

  return {
    sheetId: sheetIdMatch[1],
    gid: gidMatch ? gidMatch[1] : undefined
  };
};

// 解析 CSV 格式的資料行
const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else if (char === '\t' && !inQuotes) {
      // 支援 Tab 分隔
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// 取得試算表的基本資訊（標題等）
const getSpreadsheetInfo = async (sheetId: string, apiKey: string): Promise<{ title: string; sheets: any[] }> => {
  const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
  
  console.log('正在測試 API 金鑰...');
  const response = await fetch(metadataUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API 請求失敗:', response.status, errorText);
    
    if (response.status === 403) {
      throw new Error('API 金鑰無效或權限不足');
    } else if (response.status === 400) {
      throw new Error('API 請求格式錯誤');
    } else if (response.status === 404) {
      throw new Error('找不到指定的試算表');
    }
    throw new Error(`API 請求失敗 (${response.status}): ${response.statusText}`);
  }
  
  const metadata = await response.json();
  console.log('API 金鑰測試成功！');
  return {
    title: metadata.properties?.title || '未命名試算表',
    sheets: metadata.sheets || []
  };
};

export const fetchGoogleSheetData = async (sheetIdOrUrl: string): Promise<{
  cardData: CardData[];
  sheetInfo: {
    title: string;
    sheetName?: string;
    totalCards: number;
  };
}> => {
  try {
    const { sheetId, gid } = extractSheetInfo(sheetIdOrUrl.trim());
    
    // 從環境變數取得 API 金鑰，如果沒有則使用測試用的公開金鑰
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'AIzaSyBqJ8nzKbJ8nzKbJ8nzKbJ8nzKbJ8nzKbJ8';
    
    console.log('使用的 API 金鑰:', apiKey ? `${apiKey.substring(0, 10)}...` : '未設定');
    
    // 取得試算表基本資訊
    let spreadsheetInfo: { title: string; sheets: any[] };
    try {
      spreadsheetInfo = await getSpreadsheetInfo(sheetId, apiKey);
      console.log('成功取得試算表資訊:', spreadsheetInfo.title);
    } catch (error) {
      console.error('無法取得試算表 metadata:', error);
      // 檢查是否為 API 金鑰問題
      if (error instanceof Error && error.message.includes('403')) {
        throw new Error('API 金鑰權限不足或無效\n\n🔧 可能的解決方法：\n1. 檢查 API 金鑰是否正確\n2. 確認已在 Google Cloud Console 啟用 Google Sheets API\n3. 檢查 API 金鑰的使用限制\n4. 試算表必須設為公開可讀取');
      } else if (error instanceof Error && error.message.includes('400')) {
        throw new Error('API 請求格式錯誤\n\n🔧 可能的解決方法：\n1. 檢查試算表 ID 是否正確\n2. 確認試算表連結格式正確\n3. 檢查 API 金鑰格式');
      }
      // 如果無法取得 metadata，使用預設值並繼續嘗試
      spreadsheetInfo = { title: '試算表', sheets: [] };
    }
    
    // 嘗試多種讀取方式，從最簡單的開始
    const attempts = [
      'A:C', // 預設範圍，不指定工作表
      'Sheet1!A:C', // 預設工作表名稱
      '工作表1!A:C', // 中文工作表名稱
      '1!A:C', // 數字工作表名稱
    ];

    let lastError: Error | null = null;
    let responseData: any = null;
    let usedSheetName: string | undefined = undefined;
    
    // 先嘗試直接讀取資料，不取得 metadata
    for (const range of attempts) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
        console.log(`嘗試讀取範圍: ${range}`);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.values && data.values.length >= 2) {
            responseData = data;
            usedSheetName = range.includes('!') ? range.split('!')[0] : undefined;
            console.log(`成功讀取範圍: ${range}`, data);
            break;
          } else {
            console.log(`範圍 ${range} 資料不足:`, data);
          }
        } else {
          const errorText = await response.text();
          console.log(`範圍 ${range} 讀取失敗:`, response.status, errorText);
          
          if (response.status === 400) {
            lastError = new Error('API 請求格式錯誤\n\n可能原因：\n1. API 金鑰無效或已過期\n2. Google Sheets API 未啟用\n3. 試算表 ID 格式錯誤\n\n🔧 解決方法：\n1. 檢查 API 金鑰是否正確\n2. 確認已在 Google Cloud Console 啟用 Google Sheets API\n3. 驗證試算表連結格式');
          } else if (response.status === 403) {
            lastError = new Error('試算表權限不足，請確認已設為公開。\n\n📝 詳細設定步驟：\n1. 開啟您的 Google Sheets\n2. 點選右上角「共用」按鈕\n3. 點選「變更」連結\n4. 選擇「知道連結的任何人」\n5. 權限設為「檢視者」\n6. 點選「完成」');
          } else if (response.status === 404) {
            lastError = new Error('找不到試算表，請檢查連結是否正確');
          } else {
            lastError = new Error(`讀取失敗 (${response.status}): ${response.statusText}`);
          }
        }
      } catch (error) {
        console.error(`範圍 ${range} 發生錯誤:`, error);
        lastError = error instanceof Error ? error : new Error('網路錯誤');
        continue;
      }
    }
    
    // 如果有指定 gid，嘗試取得工作表名稱
    if (!responseData && gid && spreadsheetInfo.sheets.length > 0) {
      try {
        console.log('嘗試使用 gid 取得工作表...');
        const sheet = spreadsheetInfo.sheets.find((s: any) => s.properties.sheetId.toString() === gid);
        
        if (sheet) {
          const sheetName = sheet.properties.title;
          const range = `'${sheetName}'!A:C`;
          
          console.log(`找到工作表名稱: ${sheetName}，嘗試讀取...`);
          
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            if (data.values && data.values.length >= 2) {
              responseData = data;
              usedSheetName = sheetName;
            }
          }
        } else {
          const availableSheets = spreadsheetInfo.sheets.map((s: any) => 
            `${s.properties.title} (gid: ${s.properties.sheetId})`
          ).join('\n') || '無';
          
          throw new Error(`找不到 gid=${gid} 的工作表。\n\n可用的工作表：\n${availableSheets}`);
        }
      } catch (error) {
        console.error('使用 gid 取得工作表失敗:', error);
        // 繼續使用之前的錯誤
      }
    }
    
    if (!responseData) {
      if (lastError) {
        throw lastError;
      }
      throw new Error('無法讀取試算表資料，請檢查連結和權限設定');
    }
    
    // 處理資料
    const rows = responseData.values.slice(1); // 跳過標題列
    const cardData: CardData[] = [];
    
    console.log('開始處理資料行:', rows);
    
    rows.forEach((row: any[], index: number) => {
      // 處理不同的資料格式
      let parsedRow: string[];
      
      if (typeof row === 'string') {
        // 如果整行是字串，嘗試解析
        parsedRow = parseCSVRow(row);
      } else if (Array.isArray(row)) {
        // 如果是陣列，直接使用
        parsedRow = row.map(cell => String(cell || '').trim());
      } else {
        console.log(`跳過無效的資料行 ${index + 2}:`, row);
        return;
      }
      
      console.log(`處理第 ${index + 2} 行:`, parsedRow);
      
      // 檢查是否有足夠的資料
      if (parsedRow.length >= 2 && parsedRow[0] && parsedRow[1]) {
        const name = parsedRow[0].trim();
        const image = parsedRow[1].trim();
        const englishName = parsedRow[2]?.trim() || undefined;
        
        if (name && image) {
          cardData.push({
            id: `sheet-${index}`,
            name,
            image,
            englishName,
          });
          
          console.log(`成功新增卡片:`, { name, image, englishName });
        }
      } else {
        console.log(`跳過資料不足的第 ${index + 2} 行:`, parsedRow);
      }
    });
    
    console.log(`總共處理了 ${cardData.length} 張卡片`);
    
    if (cardData.length < 3) {
      throw new Error(`資料不足，目前只有 ${cardData.length} 張卡片，至少需要 3 張才能開始遊戲。\n\n請檢查：\n1. 試算表是否有足夠的資料行\n2. 每行是否都有名稱和圖片\n3. 資料格式是否正確`);
    }
    
    return {
      cardData,
      sheetInfo: {
        title: spreadsheetInfo.title,
        sheetName: usedSheetName,
        totalCards: cardData.length,
      }
    };
    
  } catch (error) {
    console.error('fetchGoogleSheetData 錯誤:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('載入試算表時發生未知錯誤');
  }
};