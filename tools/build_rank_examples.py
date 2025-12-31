#!/usr/bin/env python3
"""Rank A/B/C の参照用単語データを生成・更新するスクリプト。

要点
 - word.csv (Level,Word,Meaning) から Rank A/B/C に振り分け
 - 例文は“用法依存”を避けるため、単語そのものを説明するメタ文にする
   例(英): The word "apple".
   例(日): 「apple」は「りんご」という意味です。
 - 生成後に2重チェックを実施し、検証レポートを data/validation_rank_words.json に出力

注: 本スクリプトは「ループしない」ように 1 回生成 + 1 回検証で終了する。
"""

from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


RANK_MAP = {
    "最頻出(Rank A)": ("rankA_words.json", "最頻出"),
    "頻出(Rank B)": ("rankB_words.json", "頻出"),
    "よく出る(Rank C)": ("rankC_words.json", "よく出る"),
}


# 「確実に正しい」範囲だけに留めるため、POS は限定的に判定する。
POS_SAFE: Dict[str, str] = {
    # Pronouns / Possessives / Demonstratives / WH
    "i": "代名詞（主格）",
    "you": "代名詞（主格/目的格）",
    "he": "代名詞（主格）",
    "she": "代名詞（主格）",
    "it": "代名詞（主格）",
    "we": "代名詞（主格）",
    "they": "代名詞（主格）",
    "me": "代名詞（目的格）",
    "him": "代名詞（目的格）",
    "her": "代名詞（目的格/所有格）",
    "us": "代名詞（目的格）",
    "them": "代名詞（目的格）",
    "my": "所有格（形容詞的用法）",
    "your": "所有格（形容詞的用法）",
    "his": "所有格（形容詞的用法/代名詞的用法）",
    "our": "所有格（形容詞的用法）",
    "their": "所有格（形容詞的用法）",
    "this": "指示語（this）",
    "that": "指示語（that）",
    "these": "指示語（these）",
    "those": "指示語（those）",
    "who": "疑問詞（who）",
    "what": "疑問詞（what）",
    "which": "疑問詞（which）",
    "when": "疑問詞（when）",
    "where": "疑問詞（where）",
    "why": "疑問詞（why）",
    "how": "疑問詞（how）",
    # Articles
    "a": "冠詞（不定冠詞）",
    "an": "冠詞（不定冠詞）",
    "the": "冠詞（定冠詞）",
}


@dataclass
class Row:
    level: str
    word: str
    meaning: str


def read_csv(path: Path) -> List[Row]:
    """CSVの形式ゆれに対応して読み込む。

    想定される2パターン:
      1) 通常: Level,Word,Meaning が3列
      2) 1列: 1セルに "Level,Word,Meaning" / "最頻出(Rank A),I,私" のように入っている
    """
    rows: List[Row] = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        for raw in reader:
            if not raw:
                continue

            # 1列で "A,B,C" 形式の場合は分解する
            if len(raw) == 1 and isinstance(raw[0], str) and raw[0].count(',') >= 2:
                parts = [p.strip() for p in raw[0].split(',', 2)]
            else:
                parts = [p.strip() for p in raw]

            # header
            if parts[:3] == ["Level", "Word", "Meaning"]:
                continue

            if len(parts) < 3:
                continue

            level, word, meaning = parts[0], parts[1], parts[2]
            if not level or not word:
                continue
            rows.append(Row(level=level, word=word, meaning=meaning))

    return rows


def build_example(word: str, meaning: str) -> Dict[str, str]:
    # 用法に依存しない“メタ文”にすることで誤りを最小化
    # 英文側に日本語を入れない（TTSが読みやすい）
    en = f'The word "{word}".'
    ja = f'「{word}」は「{meaning}」という意味です。' if meaning else f'この単語は「{word}」です。'
    return {"en": en, "ja": ja}


def build_items(rows: List[Row]) -> Dict[str, List[Dict]]:
    out: Dict[str, List[Dict]] = {"rankA_words.json": [], "rankB_words.json": [], "rankC_words.json": []}
    counters: Dict[str, int] = {k: 0 for k in out.keys()}

    for row in rows:
        if row.level not in RANK_MAP:
            continue
        fname, cat = RANK_MAP[row.level]
        counters[fname] += 1
        w = row.word.strip()
        m = row.meaning.strip()
        key = w.lower()
        item = {
            "_no": counters[fname],
            "word": w,
            "meaning": m,
            "category": cat,
            "example": build_example(w, m),
            # 補足情報（確実に正しい範囲のみ）
            "info": {
                "rank": "A" if fname.startswith("rankA") else ("B" if fname.startswith("rankB") else "C"),
                "pos": POS_SAFE.get(key, ""),
            },
        }
        out[fname].append(item)

    return out


def validate_items(items: List[Dict]) -> Tuple[List[Dict], Dict[str, int]]:
    """2重チェックのうち『検証チェック』。
    - 例文が存在する
    - 英例文に単語が含まれる（引用符付きで厳密チェック）
    - 日本語例文が空でない
    - _no が連番である
    """
    issues: List[Dict] = []
    counts = {"total": len(items), "issues": 0}

    expected_no = 1
    for it in items:
        w = str(it.get("word", "")).strip()
        ex = it.get("example") or {}
        ex_en = str(ex.get("en", "")).strip()
        ex_ja = str(ex.get("ja", "")).strip()

        local: List[str] = []

        if it.get("_no") != expected_no:
            local.append(f"_no が連番ではありません（期待: {expected_no}, 実際: {it.get('_no')}）")

        if not w:
            local.append("word が空です")

        if not ex_en or not ex_ja:
            local.append("example(en/ja) が不足しています")
        else:
            # 英例文側に "word" が含まれているか（大文字小文字は無視）
            # ※ "The word \"X\"." 形式を期待
            pat = re.compile(r'"' + re.escape(w) + r'"', re.IGNORECASE)
            if not pat.search(ex_en):
                local.append("英例文に単語が含まれていません")

        if local:
            counts["issues"] += 1
            issues.append({"word": w, "messages": local})

        expected_no += 1

    return issues, counts


def main() -> None:
    csv_path = ROOT / "word.csv"
    if not csv_path.exists():
        # 上位ディレクトリから呼ぶケースを想定
        csv_path = ROOT.parent / "word.csv"
    if not csv_path.exists():
        raise SystemExit("word.csv が見つかりません")

    rows = read_csv(csv_path)
    built = build_items(rows)

    report = {
        "source": str(csv_path),
        "files": {},
        "summary": {},
    }

    # 生成チェック（必須キーの付与） → 検証チェック（issues抽出）
    for fname, items in built.items():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        out_path = DATA_DIR / fname
        with out_path.open("w", encoding="utf-8") as f:
            json.dump({"items": items}, f, ensure_ascii=False, indent=2)

        issues, counts = validate_items(items)
        report["files"][fname] = {
            "counts": counts,
            "issues": issues[:50],  # UIで扱いやすいよう上限
        }
        report["summary"][fname] = counts

    # 全体レポート
    with (DATA_DIR / "validation_rank_words.json").open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("[OK] Rank A/B/C JSON updated")
    print("[OK] validation_rank_words.json written")


if __name__ == "__main__":
    main()
