import { useEffect } from "react";

export default function PreloadDiceImages() {
  useEffect(() => {
    const imageList = [
      "Dice_1.png",
      "Dice_2.png",
      "Dice_3.png",
      "Dice_4.png",
      "Dice_5.png",
      "Dice_6.png",
      "Dice_Selected_1.png",
      "Dice_Selected_2.png",
      "Dice_Selected_3.png",
      "Dice_Selected_4.png",
      "Dice_Selected_5.png",
      "Dice_Selected_6.png",
      "Hand_111.png",
      "Hand_123.png",
      "Hand_456.png",
      "Hand_nnn.png",
      "Hand_Selected_111.png",
      "Hand_Selected_123.png",
      "Hand_Selected_456.png",
      "Hand_Selected_nnn.png"
    ];

    // 裏で画像を生成して先に読み込む
    imageList.forEach(src => {
      const img = new Image();
      img.src = `/images/${src}`;
      // 強制的にキャッシュするために onload/onerror は不要
    });
  }, []);

  return null; // このコンポーネント自体は表示しない
}
