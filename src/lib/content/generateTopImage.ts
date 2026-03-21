import { createCanvas, registerFont, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// 筆文字フォントを登録
registerFont("public/fonts/Oumen-mouhitsu.otf", { family: "OumenMouhitsu" });

const TEMPLATE_IMAGES = [
  "public/image/background_templete/temp_1.png",
  "public/image/background_templete/temp_2.png",
  "public/image/background_templete/temp_3.png",
  "public/image/background_templete/temp_4.png",
  "public/image/background_templete/temp_5.png",
  "public/image/background_templete/temp_6.png",
];

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

/**
 * テンプレート画像上にタイトルを描画して保存する
 * @param title タイトル文字列
 * @param outPath 保存先パス（例: public/image/project/xxx.png）
 * @param options seed: テンプレート選択用の一意な値
 */
export async function generateTopImage(
  title: string,
  outPath: string,
  options?: { seed?: string },
) {
  const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  // seedからテンプレートを決定
  const seed = options?.seed || title;
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  const idx = parseInt(hash.slice(0, 8), 16) % TEMPLATE_IMAGES.length;
  const bg = await loadImage(TEMPLATE_IMAGES[idx]);
  ctx.drawImage(bg, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

  // タイトルテキスト
  ctx.font = "bold 72px 'OumenMouhitsu', sans-serif";
  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, IMAGE_WIDTH / 2, IMAGE_HEIGHT / 2);

  // 保存
  const outAbs = path.join(process.cwd(), outPath);
  const buffer = canvas.toBuffer("image/png");
  await fs.promises.writeFile(outAbs, buffer);
}
