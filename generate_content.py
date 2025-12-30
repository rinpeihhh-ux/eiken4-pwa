#!/usr/bin/env python3
"""
英検4級アプリ用のコンテンツデータ生成スクリプト
"""

import json
import random

# 英検4級レベルの単語データ（Day 4-10用）
vocabulary_data_day4_10 = {
    4: [
        {"id": "v031", "english": "able", "japanese": "できる", "partOfSpeech": "形容詞", "example": {"en": "I am able to swim.","ja": "私は泳ぐことができます。"}},
        {"id": "v032", "english": "address", "japanese": "住所", "partOfSpeech": "名詞", "example": {"en": "What's your address?", "ja": "あなたの住所は何ですか？"}},
        {"id": "v033", "english": "after", "japanese": "〜の後で", "partOfSpeech": "前置詞", "example": {"en": "After school, I play soccer.", "ja": "放課後、私はサッカーをします。"}},
        {"id": "v034", "english": "again", "japanese": "再び", "partOfSpeech": "副詞", "example": {"en": "Please say it again.", "ja": "もう一度言ってください。"}},
        {"id": "v035", "english": "ago", "japanese": "〜前に", "partOfSpeech": "副詞", "example": {"en": "I met him two days ago.", "ja": "私は2日前に彼に会いました。"}},
        {"id": "v036", "english": "airport", "japanese": "空港", "partOfSpeech": "名詞", "example": {"en": "We went to the airport.", "ja": "私たちは空港に行きました。"}},
        {"id": "v037", "english": "along", "japanese": "〜に沿って", "partOfSpeech": "前置詞", "example": {"en": "Walk along this street.", "ja": "この通りに沿って歩いてください。"}},
        {"id": "v038", "english": "always", "japanese": "いつも", "partOfSpeech": "副詞", "example": {"en": "I always get up early.", "ja": "私はいつも早起きします。"}},
        {"id": "v039", "english": "angry", "japanese": "怒っている", "partOfSpeech": "形容詞", "example": {"en": "My mother is angry.", "ja": "私の母は怒っています。"}},
        {"id": "v040", "english": "another", "japanese": "もう一つの", "partOfSpeech": "形容詞", "example": {"en": "I need another pen.", "ja": "私は別のペンが必要です。"}},
    ],
    5: [
        {"id": "v041", "english": "answer", "japanese": "答え", "partOfSpeech": "名詞", "example": {"en": "Do you know the answer?", "ja": "答えを知っていますか？"}},
        {"id": "v042", "english": "anyone", "japanese": "誰か", "partOfSpeech": "代名詞", "example": {"en": "Is anyone here?", "ja": "誰かいますか？"}},
        {"id": "v043", "english": "anywhere", "japanese": "どこかに", "partOfSpeech": "副詞", "example": {"en": "You can sit anywhere.", "ja": "どこに座ってもいいですよ。"}},
        {"id": "v044", "english": "April", "japanese": "4月", "partOfSpeech": "名詞", "example": {"en": "My birthday is in April.", "ja": "私の誕生日は4月です。"}},
        {"id": "v045", "english": "around", "japanese": "〜の周りに", "partOfSpeech": "前置詞", "example": {"en": "There are trees around the house.", "ja": "家の周りに木があります。"}},
        {"id": "v046", "english": "arrive", "japanese": "到着する", "partOfSpeech": "動詞", "example": {"en": "We will arrive at 10.", "ja": "私たちは10時に到着します。"}},
        {"id": "v047", "english": "art", "japanese": "芸術", "partOfSpeech": "名詞", "example": {"en": "I like art.", "ja": "私は芸術が好きです。"}},
        {"id": "v048", "english": "ask", "japanese": "尋ねる", "partOfSpeech": "動詞", "example": {"en": "Can I ask you a question?", "ja": "質問してもいいですか？"}},
        {"id": "v049", "english": "August", "japanese": "8月", "partOfSpeech": "名詞", "example": {"en": "School starts in August.", "ja": "学校は8月に始まります。"}},
        {"id": "v050", "english": "aunt", "japanese": "おば", "partOfSpeech": "名詞", "example": {"en": "My aunt lives in Tokyo.", "ja": "私のおばは東京に住んでいます。"}},
    ],
    6: [
        {"id": "v051", "english": "back", "japanese": "後ろ", "partOfSpeech": "名詞", "example": {"en": "Sit in the back.", "ja": "後ろに座ってください。"}},
        {"id": "v052", "english": "bad", "japanese": "悪い", "partOfSpeech": "形容詞", "example": {"en": "That's a bad idea.", "ja": "それは悪い考えです。"}},
        {"id": "v053", "english": "baseball", "japanese": "野球", "partOfSpeech": "名詞", "example": {"en": "I play baseball.", "ja": "私は野球をします。"}},
        {"id": "v054", "english": "basketball", "japanese": "バスケットボール", "partOfSpeech": "名詞", "example": {"en": "He likes basketball.", "ja": "彼はバスケットボールが好きです。"}},
        {"id": "v055", "english": "beach", "japanese": "海岸", "partOfSpeech": "名詞", "example": {"en": "We went to the beach.", "ja": "私たちは海岸に行きました。"}},
        {"id": "v056", "english": "because", "japanese": "なぜなら", "partOfSpeech": "接続詞", "example": {"en": "I stayed home because I was sick.", "ja": "私は病気だったので家にいました。"}},
        {"id": "v057", "english": "become", "japanese": "〜になる", "partOfSpeech": "動詞", "example": {"en": "I want to become a teacher.", "ja": "私は先生になりたいです。"}},
        {"id": "v058", "english": "bedroom", "japanese": "寝室", "partOfSpeech": "名詞", "example": {"en": "This is my bedroom.", "ja": "これは私の寝室です。"}},
        {"id": "v059", "english": "before", "japanese": "〜の前に", "partOfSpeech": "前置詞", "example": {"en": "Wash your hands before dinner.", "ja": "夕食前に手を洗ってください。"}},
        {"id": "v060", "english": "begin", "japanese": "始まる", "partOfSpeech": "動詞", "example": {"en": "The class begins at 9.", "ja": "授業は9時に始まります。"}},
    ],
    7: [
        {"id": "v061", "english": "believe", "japanese": "信じる", "partOfSpeech": "動詞", "example": {"en": "I believe you.", "ja": "私はあなたを信じます。"}},
        {"id": "v062", "english": "beside", "japanese": "〜のそばに", "partOfSpeech": "前置詞", "example": {"en": "Sit beside me.", "ja": "私のそばに座ってください。"}},
        {"id": "v063", "english": "between", "japanese": "〜の間に", "partOfSpeech": "前置詞", "example": {"en": "The park is between the school and the station.", "ja": "公園は学校と駅の間にあります。"}},
        {"id": "v064", "english": "bike", "japanese": "自転車", "partOfSpeech": "名詞", "example": {"en": "I ride my bike to school.", "ja": "私は自転車で学校に行きます。"}},
        {"id": "v065", "english": "birthday", "japanese": "誕生日", "partOfSpeech": "名詞", "example": {"en": "Today is my birthday.", "ja": "今日は私の誕生日です。"}},
        {"id": "v066", "english": "blue", "japanese": "青い", "partOfSpeech": "形容詞", "example": {"en": "I like blue.", "ja": "私は青が好きです。"}},
        {"id": "v067", "english": "boat", "japanese": "ボート", "partOfSpeech": "名詞", "example": {"en": "We went on a boat.", "ja": "私たちはボートに乗りました。"}},
        {"id": "v068", "english": "both", "japanese": "両方とも", "partOfSpeech": "形容詞", "example": {"en": "Both of them are my friends.", "ja": "彼ら両方とも私の友達です。"}},
        {"id": "v069", "english": "bottle", "japanese": "ボトル", "partOfSpeech": "名詞", "example": {"en": "I need a bottle of water.", "ja": "私は水のボトルが必要です。"}},
        {"id": "v070", "english": "bridge", "japanese": "橋", "partOfSpeech": "名詞", "example": {"en": "There is a bridge over the river.", "ja": "川に橋があります。"}},
    ],
    8: [
        {"id": "v071", "english": "bright", "japanese": "明るい", "partOfSpeech": "形容詞", "example": {"en": "The sun is bright.", "ja": "太陽は明るいです。"}},
        {"id": "v072", "english": "bring", "japanese": "持ってくる", "partOfSpeech": "動詞", "example": {"en": "Please bring your book.", "ja": "本を持ってきてください。"}},
        {"id": "v073", "english": "brother", "japanese": "兄弟", "partOfSpeech": "名詞", "example": {"en": "I have one brother.", "ja": "私には兄弟が一人います。"}},
        {"id": "v074", "english": "brown", "japanese": "茶色の", "partOfSpeech": "形容詞", "example": {"en": "I have brown hair.", "ja": "私は茶色の髪をしています。"}},
        {"id": "v075", "english": "build", "japanese": "建てる", "partOfSpeech": "動詞", "example": {"en": "They will build a new house.", "ja": "彼らは新しい家を建てます。"}},
        {"id": "v076", "english": "building", "japanese": "建物", "partOfSpeech": "名詞", "example": {"en": "That is a tall building.", "ja": "あれは高い建物です。"}},
        {"id": "v077", "english": "bus", "japanese": "バス", "partOfSpeech": "名詞", "example": {"en": "I take the bus to school.", "ja": "私はバスで学校に行きます。"}},
        {"id": "v078", "english": "busy", "japanese": "忙しい", "partOfSpeech": "形容詞", "example": {"en": "I'm very busy today.", "ja": "私は今日とても忙しいです。"}},
        {"id": "v079", "english": "butter", "japanese": "バター", "partOfSpeech": "名詞", "example": {"en": "I like butter on bread.", "ja": "私はパンにバターをつけるのが好きです。"}},
        {"id": "v080", "english": "call", "japanese": "電話する", "partOfSpeech": "動詞", "example": {"en": "Please call me later.", "ja": "後で電話してください。"}},
    ],
    9: [
        {"id": "v081", "english": "camera", "japanese": "カメラ", "partOfSpeech": "名詞", "example": {"en": "I have a new camera.", "ja": "私は新しいカメラを持っています。"}},
        {"id": "v082", "english": "can", "japanese": "できる", "partOfSpeech": "助動詞", "example": {"en": "I can speak English.", "ja": "私は英語を話すことができます。"}},
        {"id": "v083", "english": "candy", "japanese": "キャンディー", "partOfSpeech": "名詞", "example": {"en": "I like candy.", "ja": "私はキャンディーが好きです。"}},
        {"id": "v084", "english": "cap", "japanese": "帽子", "partOfSpeech": "名詞", "example": {"en": "He is wearing a cap.", "ja": "彼は帽子をかぶっています。"}},
        {"id": "v085", "english": "card", "japanese": "カード", "partOfSpeech": "名詞", "example": {"en": "I sent her a birthday card.", "ja": "私は彼女に誕生日カードを送りました。"}},
        {"id": "v086", "english": "careful", "japanese": "注意深い", "partOfSpeech": "形容詞", "example": {"en": "Be careful!", "ja": "気をつけて！"}},
        {"id": "v087", "english": "carry", "japanese": "運ぶ", "partOfSpeech": "動詞", "example": {"en": "Can you carry this bag?", "ja": "このバッグを運んでくれますか？"}},
        {"id": "v088", "english": "catch", "japanese": "捕まえる", "partOfSpeech": "動詞", "example": {"en": "Catch the ball!", "ja": "ボールを捕まえて！"}},
        {"id": "v089", "english": "chair", "japanese": "椅子", "partOfSpeech": "名詞", "example": {"en": "Please sit on the chair.", "ja": "椅子に座ってください。"}},
        {"id": "v090", "english": "change", "japanese": "変える", "partOfSpeech": "動詞", "example": {"en": "I want to change my shirt.", "ja": "私はシャツを着替えたいです。"}},
    ],
    10: [
        {"id": "v091", "english": "cheap", "japanese": "安い", "partOfSpeech": "形容詞", "example": {"en": "This book is cheap.", "ja": "この本は安いです。"}},
        {"id": "v092", "english": "check", "japanese": "確認する", "partOfSpeech": "動詞", "example": {"en": "Check your answers.", "ja": "答えを確認してください。"}},
        {"id": "v093", "english": "chicken", "japanese": "鶏肉", "partOfSpeech": "名詞", "example": {"en": "I like chicken.", "ja": "私は鶏肉が好きです。"}},
        {"id": "v094", "english": "child", "japanese": "子供", "partOfSpeech": "名詞", "example": {"en": "The child is cute.", "ja": "その子供はかわいいです。"}},
        {"id": "v095", "english": "children", "japanese": "子供たち", "partOfSpeech": "名詞", "example": {"en": "The children are playing.", "ja": "子供たちは遊んでいます。"}},
        {"id": "v096", "english": "chocolate", "japanese": "チョコレート", "partOfSpeech": "名詞", "example": {"en": "I love chocolate.", "ja": "私はチョコレートが大好きです。"}},
        {"id": "v097", "english": "church", "japanese": "教会", "partOfSpeech": "名詞", "example": {"en": "We go to church on Sunday.", "ja": "私たちは日曜日に教会に行きます。"}},
        {"id": "v098", "english": "city", "japanese": "都市", "partOfSpeech": "名詞", "example": {"en": "Tokyo is a big city.", "ja": "東京は大きな都市です。"}},
        {"id": "v099", "english": "class", "japanese": "クラス", "partOfSpeech": "名詞", "example": {"en": "Our class has 30 students.", "ja": "私たちのクラスには30人の生徒がいます。"}},
        {"id": "v100", "english": "clean", "japanese": "きれいな", "partOfSpeech": "形容詞", "example": {"en": "My room is clean.", "ja": "私の部屋はきれいです。"}},
    ]
}

# 文法問題データ（Day 4-10用）
grammar_data_day4_10 = {
    4: [
        {"id": "g016", "day": 4, "question": "I ___ swim very well.", "options": ["can", "are", "is", "do"], "answer": 0, "explanation": "助動詞canは「〜できる」という能力を表します。"},
        {"id": "g017", "day": 4, "question": "She ___ play the piano.", "options": ["will", "does", "am", "are"], "answer": 0, "explanation": "助動詞willは未来や意志を表します。"},
        {"id": "g018", "day": 4, "question": "___ you help me?", "options": ["Can", "Is", "Are", "Do"], "answer": 0, "explanation": "Can you...?で「〜してもらえますか？」という依頼になります。"},
        {"id": "g019", "day": 4, "question": "He ___ come tomorrow.", "options": ["will", "can", "is", "does"], "answer": 0, "explanation": "will + 動詞の原形で未来を表します。"},
        {"id": "g020", "day": 4, "question": "I ___ speak English.", "options": ["can", "will", "am", "do"], "answer": 0, "explanation": "canは能力「〜できる」を表す助動詞です。"},
    ],
    5: [
        {"id": "g021", "day": 5, "question": "___ you like coffee?", "options": ["Do", "Are", "Is", "Can"], "answer": 0, "explanation": "Do you...?で一般動詞の疑問文を作ります。"},
        {"id": "g022", "day": 5, "question": "___ he a student?", "options": ["Is", "Does", "Do", "Are"], "answer": 0, "explanation": "Is he...?でbe動詞の疑問文を作ります。"},
        {"id": "g023", "day": 5, "question": "She ___ not like fish.", "options": ["does", "is", "do", "are"], "answer": 0, "explanation": "does notで三人称単数の否定文を作ります。"},
        {"id": "g024", "day": 5, "question": "___ they students?", "options": ["Are", "Is", "Do", "Does"], "answer": 0, "explanation": "Are they...?で複数の疑問文を作ります。"},
        {"id": "g025", "day": 5, "question": "I ___ not a teacher.", "options": ["am", "is", "do", "does"], "answer": 0, "explanation": "I am notで否定文を作ります。"},
    ],
    6: [
        {"id": "g026", "day": 6, "question": "This is ___ book.", "options": ["my", "I", "me", "mine"], "answer": 0, "explanation": "所有格myは「私の」という意味です。"},
        {"id": "g027", "day": 6, "question": "She is taller than ___.", "options": ["me", "I", "my", "mine"], "answer": 0, "explanation": "thanの後は目的格meを使います。"},
        {"id": "g028", "day": 6, "question": "This book is ___.", "options": ["mine", "my", "I", "me"], "answer": 0, "explanation": "所有代名詞mineは「私のもの」という意味です。"},
        {"id": "g029", "day": 6, "question": "He is ___ than his brother.", "options": ["taller", "tall", "tallest", "the tall"], "answer": 0, "explanation": "比較級は-erをつけて作ります。"},
        {"id": "g030", "day": 6, "question": "___ car is red.", "options": ["Her", "She", "Hers", "She's"], "answer": 0, "explanation": "所有格Herは「彼女の」という意味です。"},
    ],
    7: [
        {"id": "g031", "day": 7, "question": "I like ___ apples.", "options": ["eating", "eat", "to eating", "eats"], "answer": 0, "explanation": "like + 動名詞で「〜することが好き」という意味になります。"},
        {"id": "g032", "day": 7, "question": "She wants ___ a doctor.", "options": ["to be", "be", "being", "is"], "answer": 0, "explanation": "want to + 動詞の原形で「〜したい」という意味です。"},
        {"id": "g033", "day": 7, "question": "I enjoy ___ music.", "options": ["listening to", "listen to", "to listen", "listened"], "answer": 0, "explanation": "enjoy + 動名詞で「〜するのを楽しむ」という意味です。"},
        {"id": "g034", "day": 7, "question": "He needs ___ help.", "options": ["to get", "get", "getting", "gets"], "answer": 0, "explanation": "need to + 動詞の原形で「〜する必要がある」という意味です。"},
        {"id": "g035", "day": 7, "question": "They finished ___ their homework.", "options": ["doing", "do", "to do", "does"], "answer": 0, "explanation": "finish + 動名詞で「〜し終える」という意味です。"},
    ],
    8: [
        {"id": "g036", "day": 8, "question": "There ___ a book on the desk.", "options": ["is", "are", "am", "be"], "answer": 0, "explanation": "There is + 単数名詞で「〜があります」という意味です。"},
        {"id": "g037", "day": 8, "question": "There ___ many people in the park.", "options": ["are", "is", "am", "be"], "answer": 0, "explanation": "There are + 複数名詞で「〜があります」という意味です。"},
        {"id": "g038", "day": 8, "question": "___ there a pen here?", "options": ["Is", "Are", "Am", "Be"], "answer": 0, "explanation": "Is there...?で「〜がありますか？」という疑問文になります。"},
        {"id": "g039", "day": 8, "question": "There ___ any milk in the fridge.", "options": ["isn't", "aren't", "is", "are"], "answer": 0, "explanation": "There isn't anyで「〜がありません」という否定文です。"},
        {"id": "g040", "day": 8, "question": "___ there any questions?", "options": ["Are", "Is", "Am", "Be"], "answer": 0, "explanation": "Are there...?で複数の疑問文を作ります。"},
    ],
    9: [
        {"id": "g041", "day": 9, "question": "I have ___ this book.", "options": ["read", "reading", "to read", "reads"], "answer": 0, "explanation": "現在完了形はhave/has + 過去分詞です。"},
        {"id": "g042", "day": 9, "question": "She has ___ to Tokyo.", "options": ["been", "went", "go", "going"], "answer": 0, "explanation": "have been toで「〜に行ったことがある」という経験を表します。"},
        {"id": "g043", "day": 9, "question": "They have ___ their homework.", "options": ["finished", "finish", "finishing", "finishes"], "answer": 0, "explanation": "have + 過去分詞で完了を表します。"},
        {"id": "g044", "day": 9, "question": "Have you ___ this movie?", "options": ["seen", "see", "saw", "seeing"], "answer": 0, "explanation": "Have you...?で現在完了の疑問文を作ります。"},
        {"id": "g045", "day": 9, "question": "He has not ___ yet.", "options": ["arrived", "arrive", "arrives", "arriving"], "answer": 0, "explanation": "has not + 過去分詞で否定の現在完了形です。"},
    ],
    10: [
        {"id": "g046", "day": 10, "question": "If it ___ tomorrow, I will stay home.", "options": ["rains", "rain", "will rain", "rained"], "answer": 0, "explanation": "if節の中では現在形を使います。"},
        {"id": "g047", "day": 10, "question": "I will call you when I ___ there.", "options": ["arrive", "will arrive", "arrived", "arrives"], "answer": 0, "explanation": "when節の中では現在形で未来を表します。"},
        {"id": "g048", "day": 10, "question": "She said that she ___ tired.", "options": ["was", "is", "were", "am"], "answer": 0, "explanation": "時制の一致で過去形wasを使います。"},
        {"id": "g049", "day": 10, "question": "I don't know where he ___.", "options": ["lives", "live", "lived", "living"], "answer": 0, "explanation": "間接疑問文では主語+動詞の語順になります。"},
        {"id": "g050", "day": 10, "question": "Do you know what time it ___?", "options": ["is", "was", "are", "be"], "answer": 0, "explanation": "間接疑問文では平叙文の語順を使います。"},
    ]
}

def generate_vocabulary_json():
    """Day 4-10の単語データを既存のデータに追加"""
    # まず既存のデータを読み込む
    try:
        with open('data/vocabulary.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except:
        existing_data = []
    
    # 既存のIDを確認
    existing_ids = {item['id'] for item in existing_data}
    
    # Day 4-10のデータを追加
    for day in range(4, 11):
        for word in vocabulary_data_day4_10[day]:
            if word['id'] not in existing_ids:
                word['day'] = day
                existing_data.append(word)
    
    # ソート（day順、id順）
    existing_data.sort(key=lambda x: (x['day'], x['id']))
    
    with open('data/vocabulary.json', 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)
    
    print(f"[OK] vocabulary.json updated: {len(existing_data)} words total")

def generate_grammar_json():
    """Day 4-10の文法データを既存のデータに追加"""
    try:
        with open('data/grammar.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except:
        existing_data = []
    
    existing_ids = {item['id'] for item in existing_data}
    
    for day in range(4, 11):
        for question in grammar_data_day4_10[day]:
            if question['id'] not in existing_ids:
                existing_data.append(question)
    
    existing_data.sort(key=lambda x: (x['day'], x['id']))
    
    with open('data/grammar.json', 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)
    
    print(f"[OK] grammar.json updated: {len(existing_data)} questions total")

if __name__ == '__main__':
    print("Generating content data for Days 4-10...")
    generate_vocabulary_json()
    generate_grammar_json()
    print("\n[OK] All data files updated successfully!")
