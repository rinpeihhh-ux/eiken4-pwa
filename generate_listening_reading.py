#!/usr/bin/env python3
"""
リスニングと読解データの生成
"""

import json

# リスニングデータ（Day 5, 6, 8, 9用）
listening_data = [
    # Day 5
    {"id": "l006", "day": 5, "script": "A: What do you want for lunch? B: I want a sandwich.", "scriptJa": "A: 昼食は何が欲しいですか？ B: サンドイッチが欲しいです。", "question": "What does B want for lunch?", "questionJa": "Bは昼食に何が欲しいですか？", "options": ["A sandwich", "A salad", "Pizza", "Rice"], "answer": 0},
    {"id": "l007", "day": 5, "script": "A: Where is the library? B: It's next to the post office.", "scriptJa": "A: 図書館はどこですか？ B: 郵便局の隣です。", "question": "Where is the library?", "questionJa": "図書館はどこにありますか？", "options": ["Next to the post office", "Near the station", "In front of the school", "Behind the park"], "answer": 0},
    {"id": "l008", "day": 5, "script": "A: What time is it? B: It's three o'clock.", "scriptJa": "A: 何時ですか？ B: 3時です。", "question": "What time is it?", "questionJa": "何時ですか？", "options": ["Three o'clock", "Four o'clock", "Two o'clock", "Five o'clock"], "answer": 0},
    {"id": "l009", "day": 5, "script": "A: Do you like sports? B: Yes, I love soccer.", "scriptJa": "A: スポーツは好きですか？ B: はい、サッカーが大好きです。", "question": "What sport does B love?", "questionJa": "Bは何のスポーツが好きですか？", "options": ["Soccer", "Baseball", "Tennis", "Swimming"], "answer": 0},
    {"id": "l010", "day": 5, "script": "A: Is this your pen? B: No, it's Tom's pen.", "scriptJa": "A: これはあなたのペンですか？ B: いいえ、トムのペンです。", "question": "Whose pen is it?", "questionJa": "それは誰のペンですか？", "options": ["Tom's", "A's", "B's", "Mary's"], "answer": 0},
    
    # Day 6
    {"id": "l011", "day": 6, "script": "A: Can you help me? B: Sure, what do you need?", "scriptJa": "A: 手伝ってくれますか？ B: もちろん、何が必要ですか？", "question": "What does A want?", "questionJa": "Aは何を望んでいますか？", "options": ["Help", "Money", "A book", "Food"], "answer": 0},
    {"id": "l012", "day": 6, "script": "A: Where were you yesterday? B: I was at home all day.", "scriptJa": "A: 昨日はどこにいましたか？ B: 一日中家にいました。", "question": "Where was B yesterday?", "questionJa": "Bは昨日どこにいましたか？", "options": ["At home", "At school", "At the park", "At the store"], "answer": 0},
    {"id": "l013", "day": 6, "script": "A: How do you go to school? B: I usually go by bus.", "scriptJa": "A: どうやって学校に行きますか？ B: 普段はバスで行きます。", "question": "How does B usually go to school?", "questionJa": "Bはどうやって学校に行きますか？", "options": ["By bus", "By bike", "On foot", "By train"], "answer": 0},
    {"id": "l014", "day": 6, "script": "A: What's your favorite subject? B: I like math the best.", "scriptJa": "A: 好きな科目は何ですか？ B: 数学が一番好きです。", "question": "What is B's favorite subject?", "questionJa": "Bの好きな科目は何ですか？", "options": ["Math", "English", "Science", "History"], "answer": 0},
    {"id": "l015", "day": 6, "script": "A: Did you watch TV last night? B: No, I read a book.", "scriptJa": "A: 昨夜テレビを見ましたか？ B: いいえ、本を読みました。", "question": "What did B do last night?", "questionJa": "Bは昨夜何をしましたか？", "options": ["Read a book", "Watched TV", "Played games", "Studied"], "answer": 0},
    
    # Day 8
    {"id": "l016", "day": 8, "script": "Tom: Hi, Sarah. What are you doing this weekend? Sarah: I'm going shopping with my mom.", "scriptJa": "トム: やあ、サラ。今週末は何をしますか？ サラ: お母さんと買い物に行きます。", "question": "What will Sarah do this weekend?", "questionJa": "サラは今週末何をしますか？", "options": ["Go shopping", "Study", "Play sports", "Watch a movie"], "answer": 0},
    {"id": "l017", "day": 8, "script": "Mary: Do you have any plans for summer vacation? John: Yes, I'm going to visit my grandparents.", "scriptJa": "メアリー: 夏休みの予定はありますか？ ジョン: はい、祖父母を訪ねる予定です。", "question": "What is John's summer plan?", "questionJa": "ジョンの夏の計画は何ですか？", "options": ["Visit grandparents", "Go to the beach", "Stay home", "Go camping"], "answer": 0},
    {"id": "l018", "day": 8, "script": "A: Excuse me, where is the nearest station? B: Go straight and turn left. You'll see it on your right.", "scriptJa": "A: すみません、最寄りの駅はどこですか？ B: まっすぐ行って左に曲がってください。右側に見えます。", "question": "Where will A find the station?", "questionJa": "Aは駅をどこで見つけますか？", "options": ["On the right", "On the left", "Behind", "Straight ahead"], "answer": 0},
    {"id": "l019", "day": 8, "script": "Mom: Did you finish your homework? Son: Not yet. I'll do it after dinner.", "scriptJa": "母: 宿題は終わりましたか？ 息子: まだです。夕食後にやります。", "question": "When will the son do his homework?", "questionJa": "息子はいつ宿題をしますか？", "options": ["After dinner", "Before dinner", "Now", "Tomorrow"], "answer": 0},
    {"id": "l020", "day": 8, "script": "A: How was your test? B: It was difficult, but I think I did well.", "scriptJa": "A: テストはどうでしたか？ B: 難しかったですが、うまくできたと思います。", "question": "How does B feel about the test?", "questionJa": "Bはテストについてどう感じていますか？", "options": ["Thinks they did well", "Thinks they failed", "Doesn't know", "Was easy"], "answer": 0},
    
    # Day 9
    {"id": "l021", "day": 9, "script": "Teacher: Class, we have a new student today. His name is Ken. Student: Nice to meet you, Ken!", "scriptJa": "先生: クラスのみなさん、今日は新しい生徒がいます。彼の名前はケンです。生徒: ケン、はじめまして！", "question": "Who is Ken?", "questionJa": "ケンは誰ですか？", "options": ["A new student", "A teacher", "A friend", "A visitor"], "answer": 0},
    {"id": "l022", "day": 9, "script": "Dad: What do you want to be in the future? Daughter: I want to be a teacher like you, Dad.", "scriptJa": "父: 将来は何になりたいですか？ 娘: お父さんのような先生になりたいです。", "question": "What is the daughter's dream?", "questionJa": "娘の夢は何ですか？", "options": ["To be a teacher", "To be a doctor", "To be a nurse", "To be a singer"], "answer": 0},
    {"id": "l023", "day": 9, "script": "A: Have you ever been to Kyoto? B: Yes, I went there last year. It was beautiful.", "scriptJa": "A: 京都に行ったことがありますか？ B: はい、去年行きました。きれいでした。", "question": "When did B go to Kyoto?", "questionJa": "Bはいつ京都に行きましたか？", "options": ["Last year", "This year", "Two years ago", "Never"], "answer": 0},
    {"id": "l024", "day": 9, "script": "Tom: I lost my wallet. Jane: Don't worry. Let's look for it together.", "scriptJa": "トム: 財布をなくしました。ジェーン: 心配しないで。一緒に探しましょう。", "question": "What did Tom lose?", "questionJa": "トムは何をなくしましたか？", "options": ["His wallet", "His phone", "His keys", "His bag"], "answer": 0},
    {"id": "l025", "day": 9, "script": "A: The weather is nice today. B: Yes, let's go to the park. A: That's a good idea!", "scriptJa": "A: 今日はいい天気ですね。B: はい、公園に行きましょう。A: それはいい考えですね！", "question": "What will they do?", "questionJa": "彼らは何をしますか？", "options": ["Go to the park", "Stay home", "Go shopping", "Study"], "answer": 0},
]

# 読解データ（Day 7, 8用）
reading_data = [
    # Day 7
    {
        "id": "r003",
        "day": 7,
        "title": "My Family",
        "passage": "My name is Yuki. I live with my family in Tokyo. We have four people in my family: my father, my mother, my younger brother, and me. My father is a teacher. He teaches English at a high school. My mother is a nurse. She works at a hospital near our house. My brother is ten years old. He goes to elementary school. We often have dinner together and talk about our day.",
        "passageJa": "私の名前はユキです。私は東京で家族と暮らしています。私の家族は4人です：父、母、弟、そして私です。父は教師です。彼は高校で英語を教えています。母は看護師です。彼女は家の近くの病院で働いています。弟は10歳です。彼は小学校に通っています。私たちはよく一緒に夕食を食べて、その日のことについて話します。",
        "questions": [
            {
                "question": "How many people are in Yuki's family?",
                "questionJa": "ユキの家族は何人ですか？",
                "options": ["Four", "Three", "Five", "Two"],
                "answer": 0
            },
            {
                "question": "What does Yuki's father do?",
                "questionJa": "ユキの父は何をしていますか？",
                "options": ["He is a teacher", "He is a doctor", "He is a nurse", "He is a student"],
                "answer": 0
            },
            {
                "question": "How old is Yuki's brother?",
                "questionJa": "ユキの弟は何歳ですか？",
                "options": ["Ten years old", "Twelve years old", "Eight years old", "Fifteen years old"],
                "answer": 0
            }
        ]
    },
    # Day 8
    {
        "id": "r004",
        "day": 8,
        "title": "A Weekend Plan",
        "passage": "This weekend, I'm going to visit my grandparents in Osaka. I will take the bullet train on Saturday morning. The trip takes about three hours. My grandparents live in a house near a beautiful park. I'm planning to go to the park with my grandfather. He likes to take walks there. On Sunday, my grandmother will make my favorite food for lunch. I love her cooking! I will come back home on Sunday evening. I'm really excited about this trip.",
        "passageJa": "今週末、私は大阪の祖父母を訪ねる予定です。土曜日の朝に新幹線に乗ります。旅行には約3時間かかります。祖父母はきれいな公園の近くの家に住んでいます。祖父と一緒に公園に行く予定です。彼はそこを散歩するのが好きです。日曜日に、祖母は昼食に私の好きな料理を作ってくれます。私は彼女の料理が大好きです！日曜日の夕方に家に帰ります。私はこの旅行にとても興奮しています。",
        "questions": [
            {
                "question": "How will the writer go to Osaka?",
                "questionJa": "書き手はどうやって大阪に行きますか？",
                "options": ["By bullet train", "By car", "By plane", "By bus"],
                "answer": 0
            },
            {
                "question": "What will the writer do with the grandfather?",
                "questionJa": "書き手は祖父と何をしますか？",
                "options": ["Go to the park", "Watch TV", "Play games", "Go shopping"],
                "answer": 0
            },
            {
                "question": "When will the writer come back home?",
                "questionJa": "書き手はいつ家に帰りますか？",
                "options": ["Sunday evening", "Saturday evening", "Monday morning", "Sunday morning"],
                "answer": 0
            }
        ]
    },
    {
        "id": "r005",
        "day": 8,
        "title": "School Festival",
        "passage": "Our school festival is next month. I'm very excited! Our class decided to open a food stand. We will sell curry rice and juice. Everyone in our class has a job. I will help cook the curry with three other students. Some students will sell the food, and some will clean up. We practiced making curry last weekend. It was delicious! We hope many people will come to our stand. We want to make it the best stand at the festival!",
        "passageJa": "私たちの学校祭は来月です。私はとても興奮しています！私たちのクラスは食べ物の屋台を開くことに決めました。カレーライスとジュースを売ります。クラスのみんなに仕事があります。私は他の3人の生徒とカレーを作るのを手伝います。食べ物を売る生徒もいれば、片付けをする生徒もいます。先週末にカレーを作る練習をしました。おいしかったです！多くの人が私たちの屋台に来てくれることを願っています。祭りで最高の屋台にしたいです！",
        "questions": [
            {
                "question": "When is the school festival?",
                "questionJa": "学校祭はいつですか？",
                "options": ["Next month", "This month", "Last month", "Next week"],
                "answer": 0
            },
            {
                "question": "What will the writer do at the festival?",
                "questionJa": "書き手は祭りで何をしますか？",
                "options": ["Help cook curry", "Sell food", "Clean up", "Eat food"],
                "answer": 0
            },
            {
                "question": "What will the class sell?",
                "questionJa": "クラスは何を売りますか？",
                "options": ["Curry rice and juice", "Pizza and cola", "Sandwiches and tea", "Hamburgers and water"],
                "answer": 0
            }
        ]
    }
]

def update_listening_json():
    """リスニングデータを追加"""
    try:
        with open('data/listening.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except:
        existing_data = []
    
    existing_ids = {item['id'] for item in existing_data}
    
    for item in listening_data:
        if item['id'] not in existing_ids:
            existing_data.append(item)
    
    # Ensure day field is int for proper sorting
    for item in existing_data:
        if isinstance(item.get('day'), str):
            item['day'] = int(item['day'])
    
    existing_data.sort(key=lambda x: (x['day'], x['id']))
    
    with open('data/listening.json', 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)
    
    print(f"[OK] listening.json updated: {len(existing_data)} questions total")

def update_reading_json():
    """読解データを追加"""
    try:
        with open('data/reading.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except:
        existing_data = []
    
    existing_ids = {item['id'] for item in existing_data}
    
    for item in reading_data:
        if item['id'] not in existing_ids:
            existing_data.append(item)
    
    # Ensure day field is int for proper sorting
    for item in existing_data:
        if isinstance(item.get('day'), str):
            item['day'] = int(item['day'])
    
    existing_data.sort(key=lambda x: (x['day'], x['id']))
    
    with open('data/reading.json', 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)
    
    print(f"[OK] reading.json updated: {len(existing_data)} passages total")

if __name__ == '__main__':
    print("Generating listening and reading data...")
    update_listening_json()
    update_reading_json()
    print("\n[OK] Listening and reading data updated!")
