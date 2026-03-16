import { createCanvas, registerFont, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// 筆文字フォントを登録
registerFont("public/fonts/Oumen-mouhitsu.otf", { family: "OumenMouhitsu" });

/**
 * 既存テンプレート画像からseedで背景を選び、タイトルを貼り付けて保存
 * @param title タイトル文字列
 * @param outPath 保存先パス（public/image/project/xxx.png）
 * @param options 追加オプション（seed: 一意な値）
 */
export async function generateProjectTopImage(
  title: string,
  outPath: string,
  options?: { seed?: string }
) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // テンプレート画像一覧
  const templates = [
    "public/image/background_templete/temp_1.png",
    "public/image/background_templete/temp_2.png",
    "public/image/background_templete/temp_3.png",
    "public/image/background_templete/temp_4.png",
    "public/image/background_templete/temp_5.png",
    "public/image/background_templete/temp_6.png",
  ];
  // seedからテンプレートを決定
  const seed = options?.seed || title;
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  const idx = parseInt(hash.slice(0, 8), 16) % templates.length;
  const bgPath = templates[idx];
  const bg = await loadImage(bgPath);
  ctx.drawImage(bg, 0, 0, width, height);

  // タイトルテキスト
  ctx.font = "bold 72px 'OumenMouhitsu', sans-serif";
  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // 文字背景は描画しない
  ctx.fillText(title, width / 2, height / 2);

  // 保存先をprojectフォルダに
  const outAbs = path.join(process.cwd(), outPath);
  const buffer = canvas.toBuffer("image/png");
  await fs.promises.writeFile(outAbs, buffer);
}
