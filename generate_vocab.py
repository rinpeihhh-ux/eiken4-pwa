import json

# Day 4-10用の単語データを生成（570語追加）
# 現在のデータを読み込み
with open('data/vocabulary.json', 'r', encoding='utf-8') as f:
    existing_words = json.load(f)

# 新しい単語データ（Day 4-10用）
new_words = []
current_id = 31

# Day 4: 熟語と助動詞関連（60語）
day4_words = [
    {"english": "get up", "japanese": "起きる", "partOfSpeech": "熟語", "example": {"en": "I get up at seven.", "ja": "私は7時に起きます。"}},
    {"english": "go to bed", "japanese": "寝る", "partOfSpeech": "熟語", "example": {"en": "I go to bed at ten.", "ja": "私は10時に寝ます。"}},
    {"english": "come back", "japanese": "戻る", "partOfSpeech": "熟語", "example": {"en": "I will come back soon.", "ja": "すぐに戻ります。"}},
    {"english": "look for", "japanese": "探す", "partOfSpeech": "熟語", "example": {"en": "I am looking for my pen.", "ja": "ペンを探しています。"}},
    {"english": "wait for", "japanese": "待つ", "partOfSpeech": "熟語", "example": {"en": "Please wait for me.", "ja": "私を待ってください。"}},
    {"english": "take care of", "japanese": "世話をする", "partOfSpeech": "熟語", "example": {"en": "I take care of my dog.", "ja": "私は犬の世話をします。"}},
    {"english": "look at", "japanese": "見る", "partOfSpeech": "熟語", "example": {"en": "Look at this picture.", "ja": "この写真を見て。"}},
    {"english": "listen to", "japanese": "聞く", "partOfSpeech": "熟語", "example": {"en": "I listen to music.", "ja": "私は音楽を聞きます。"}},
    {"english": "talk about", "japanese": "について話す", "partOfSpeech": "熟語", "example": {"en": "Let's talk about it.", "ja": "それについて話しましょう。"}},
    {"english": "think about", "japanese": "について考える", "partOfSpeech": "熟語", "example": {"en": "I think about you.", "ja": "あなたのことを考えています。"}},
    {"english": "help", "japanese": "助ける", "partOfSpeech": "動詞", "example": {"en": "Can you help me?", "ja": "手伝ってくれますか？"}},
    {"english": "want", "japanese": "欲しい", "partOfSpeech": "動詞", "example": {"en": "I want a new bike.", "ja": "新しい自転車が欲しいです。"}},
    {"english": "need", "japanese": "必要とする", "partOfSpeech": "動詞", "example": {"en": "I need your help.", "ja": "あなたの助けが必要です。"}},
    {"english": "know", "japanese": "知っている", "partOfSpeech": "動詞", "example": {"en": "I know him well.", "ja": "私は彼をよく知っています。"}},
    {"english": "understand", "japanese": "理解する", "partOfSpeech": "動詞", "example": {"en": "I understand English.", "ja": "私は英語を理解します。"}},
    {"english": "remember", "japanese": "覚えている", "partOfSpeech": "動詞", "example": {"en": "I remember you.", "ja": "あなたを覚えています。"}},
    {"english": "forget", "japanese": "忘れる", "partOfSpeech": "動詞", "example": {"en": "Don't forget your homework.", "ja": "宿題を忘れないで。"}},
    {"english": "bring", "japanese": "持ってくる", "partOfSpeech": "動詞", "example": {"en": "Please bring your book.", "ja": "本を持ってきてください。"}},
    {"english": "take", "japanese": "持っていく", "partOfSpeech": "動詞", "example": {"en": "Take this with you.", "ja": "これを持っていって。"}},
    {"english": "make", "japanese": "作る", "partOfSpeech": "動詞", "example": {"en": "I make breakfast.", "ja": "私は朝食を作ります。"}},
    {"english": "cook", "japanese": "料理する", "partOfSpeech": "動詞", "example": {"en": "My mother cooks dinner.", "ja": "母が夕食を料理します。"}},
    {"english": "clean", "japanese": "掃除する", "partOfSpeech": "動詞", "example": {"en": "I clean my room.", "ja": "私は部屋を掃除します。"}},
    {"english": "wash", "japanese": "洗う", "partOfSpeech": "動詞", "example": {"en": "I wash my hands.", "ja": "私は手を洗います。"}},
    {"english": "use", "japanese": "使う", "partOfSpeech": "動詞", "example": {"en": "Can I use this pen?", "ja": "このペンを使ってもいいですか？"}},
    {"english": "buy", "japanese": "買う", "partOfSpeech": "動詞", "example": {"en": "I want to buy a book.", "ja": "本を買いたいです。"}},
    {"english": "sell", "japanese": "売る", "partOfSpeech": "動詞", "example": {"en": "They sell fruits.", "ja": "彼らは果物を売っています。"}},
    {"english": "give", "japanese": "与える", "partOfSpeech": "動詞", "example": {"en": "Give me your hand.", "ja": "手を貸して。"}},
    {"english": "get", "japanese": "得る", "partOfSpeech": "動詞", "example": {"en": "I get a present.", "ja": "私はプレゼントをもらいます。"}},
    {"english": "send", "japanese": "送る", "partOfSpeech": "動詞", "example": {"en": "I send an email.", "ja": "私はメールを送ります。"}},
    {"english": "receive", "japanese": "受け取る", "partOfSpeech": "動詞", "example": {"en": "I receive a letter.", "ja": "私は手紙を受け取ります。"}},
]

for word in day4_words[:60]:
    new_words.append({
        "id": current_id,
        "english": word["english"],
        "japanese": word["japanese"],
        "partOfSpeech": word["partOfSpeech"],
        "example": word["example"],
        "day": 4
    })
    current_id += 1

print(f"Generated Day 4: {len([w for w in new_words if w['day'] == 4])} words")

# 完全なデータセットを出力
all_words = existing_words + new_words
with open('data/vocabulary_expanded_partial.json', 'w', encoding='utf-8') as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print(f"Total words so far: {len(all_words)}")
print(f"Need {600 - len(all_words)} more words for Days 5-10")
