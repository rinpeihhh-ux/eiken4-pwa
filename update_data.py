#!/usr/bin/env python3
"""
リスニングと読解データの生成（簡略版）
"""

import json

# 既存のリスニングデータを保持しつつ、新規データを追加
listening_all = [
    # 既存のDay 5データ
    {"id": "l001", "day": 5, "script": "I go to school by bus.", "scriptJa": "私はバスで学校に行きます。", "question": "How does the speaker go to school?", "questionJa": "話し手はどうやって学校に行きますか？", "options": ["By car", "By bus", "By bike", "On foot"], "answer": 1},
    {"id": "l002", "day": 5, "script": "My favorite subject is math.", "scriptJa": "私の好きな科目は数学です。", "question": "What is the speaker's favorite subject?", "questionJa": "話し手の好きな科目は何ですか？", "options": ["English", "Science", "Math", "History"], "answer": 2},
    {"id": "l003", "day": 5, "script": "I have a dog. His name is Max.", "scriptJa": "私は犬を飼っています。彼の名前はマックスです。", "question": "What is the dog's name?", "questionJa": "犬の名前は何ですか？", "options": ["Tom", "Bob", "Max", "Jack"], "answer": 2},
    {"id": "l004", "day": 5, "script": "She plays tennis every Sunday.", "scriptJa": "彼女は毎週日曜日にテニスをします。", "question": "When does she play tennis?", "questionJa": "彼女はいつテニスをしますか？", "options": ["Every Monday", "Every Sunday", "Every Saturday", "Every Friday"], "answer": 1},
    {"id": "l005", "day": 5, "script": "I ate pizza for lunch today.", "scriptJa": "私は今日の昼食にピザを食べました。", "question": "What did the speaker eat for lunch?", "questionJa": "話し手は昼食に何を食べましたか？", "options": ["Pasta", "Pizza", "Salad", "Sandwich"], "answer": 1},
    # Day 6データ
    {"id": "l006", "day": 6, "script": "Tom: Hi, Sarah. How are you? Sarah: I'm fine, thank you. Tom: Let's play soccer. Sarah: That sounds good!", "scriptJa": "トム：やあ、サラ。元気？ サラ：元気よ、ありがとう。トム：サッカーしよう。サラ：いいわね！", "question": "What will they do?", "questionJa": "彼らは何をしますか？", "options": ["Play basketball", "Play soccer", "Watch a movie", "Study together"], "answer": 1},
    {"id": "l007", "day": 6, "script": "Mike: What time is it? Lisa: It's three thirty. Mike: Oh, I have to go home now.", "scriptJa": "マイク：何時？ リサ：3時半よ。マイク：あ、もう家に帰らなきゃ。", "question": "What time is it?", "questionJa": "何時ですか？", "options": ["2:30", "3:00", "3:30", "4:00"], "answer": 2},
    {"id": "l008", "day": 6, "script": "Anna: Do you like ice cream? Ben: Yes, I do. I love chocolate ice cream. Anna: Me too!", "scriptJa": "アナ：アイスクリーム好き？ ベン：うん、大好き。チョコレートアイスが好きなんだ。アナ：私も！", "question": "What flavor does Ben like?", "questionJa": "ベンは何味が好きですか？", "options": ["Vanilla", "Strawberry", "Chocolate", "Mint"], "answer": 2},
    # Day 8データ
    {"id": "l009", "day": 8, "script": "Every morning, I wake up at seven. I eat breakfast and go to school. After school, I play with my friends. I go to bed at ten.", "scriptJa": "毎朝、私は7時に起きます。朝食を食べて学校に行きます。放課後、友達と遊びます。10時に寝ます。", "question": "What time does the speaker wake up?", "questionJa": "話し手は何時に起きますか？", "options": ["Six", "Seven", "Eight", "Nine"], "answer": 1},
    {"id": "l010", "day": 8, "script": "Last Sunday, I went to the park with my family. We had a picnic. The weather was nice and sunny.", "scriptJa": "先週の日曜日、私は家族と公園に行きました。ピクニックをしました。天気は良くて晴れていました。", "question": "How was the weather?", "questionJa": "天気はどうでしたか？", "options": ["Rainy", "Cloudy", "Sunny", "Snowy"], "answer": 2},
]

with open('data/listening.json', 'w', encoding='utf-8') as f:
    json.dump(listening_all, f, ensure_ascii=False, indent=4)

print("[OK] listening.json updated: 10 questions total")

# 既存の読解データを保持しつつ、新規データを追加
reading_all = [
    {
        "id": "r001",
        "day": 7,
        "title": "My Friend",
        "passage": "My best friend is Amy. She is from Canada. She lives in Tokyo now. Amy is very tall and has long black hair. She likes music and plays the guitar. We often go to the park together on weekends.",
        "translation": "私の親友はエイミーです。彼女はカナダ出身です。今は東京に住んでいます。エイミーはとても背が高く、長い黒髪をしています。彼女は音楽が好きでギターを弾きます。私たちはよく週末に一緒に公園に行きます。",
        "questions": [
            {"question": "Where is Amy from?", "questionJa": "エイミーはどこの出身ですか？", "options": ["America", "Canada", "Australia", "England"], "answer": 1},
            {"question": "What does Amy like?", "questionJa": "エイミーは何が好きですか？", "options": ["Sports", "Music", "Reading", "Cooking"], "answer": 1},
            {"question": "What do they do on weekends?", "questionJa": "彼らは週末何をしますか？", "options": ["Study", "Go shopping", "Go to the park", "Watch movies"], "answer": 2}
        ]
    },
    {
        "id": "r002",
        "day": 7,
        "title": "My Daily Routine",
        "passage": "I wake up at six thirty every morning. I eat breakfast with my family at seven. Then I go to school by bike. School starts at eight thirty. After school, I usually play soccer with my friends. I go home at five and do my homework. I have dinner at seven and go to bed at ten.",
        "translation": "私は毎朝6時半に起きます。7時に家族と朝食を食べます。それから自転車で学校に行きます。学校は8時半に始まります。放課後、私は普段友達とサッカーをします。5時に帰宅して宿題をします。7時に夕食を食べて10時に寝ます。",
        "questions": [
            {"question": "What time does the speaker wake up?", "questionJa": "話し手は何時に起きますか？", "options": ["6:00", "6:30", "7:00", "7:30"], "answer": 1},
            {"question": "How does the speaker go to school?", "questionJa": "話し手はどうやって学校に行きますか？", "options": ["By bus", "By bike", "By car", "On foot"], "answer": 1},
            {"question": "What does the speaker do after school?", "questionJa": "話し手は放課後何をしますか？", "options": ["Does homework", "Plays soccer", "Watches TV", "Reads books"], "answer": 1}
        ]
    },
    {
        "id": "r003",
        "day": 8,
        "title": "A School Trip",
        "passage": "Last week, we went on a school trip to Kyoto. We visited many temples and saw beautiful gardens. For lunch, we ate delicious udon noodles. In the afternoon, we went shopping for souvenirs. It was a wonderful trip and everyone had a great time.",
        "translation": "先週、私たちは京都への修学旅行に行きました。たくさんのお寺を訪れ、美しい庭園を見ました。昼食には、おいしいうどんを食べました。午後は、お土産の買い物をしました。素晴らしい旅行で、みんな楽しい時間を過ごしました。",
        "questions": [
            {"question": "Where did they go?", "questionJa": "彼らはどこに行きましたか？", "options": ["Tokyo", "Osaka", "Kyoto", "Nara"], "answer": 2},
            {"question": "What did they eat for lunch?", "questionJa": "彼らは昼食に何を食べましたか？", "options": ["Ramen", "Udon", "Sushi", "Tempura"], "answer": 1},
            {"question": "What did they do in the afternoon?", "questionJa": "彼らは午後何をしましたか？", "options": ["Visited temples", "Went shopping", "Ate lunch", "Went home"], "answer": 1}
        ]
    },
    {
        "id": "r004",
        "day": 8,
        "title": "My Hobby",
        "passage": "I like reading books. My favorite book is 'Harry Potter'. I read it last year. The story is very exciting. I also like to draw pictures. I draw pictures of animals and flowers. My mother puts my pictures on the wall. She says I'm a good artist.",
        "translation": "私は本を読むのが好きです。私の好きな本は「ハリー・ポッター」です。去年それを読みました。物語はとても面白いです。私は絵を描くことも好きです。動物や花の絵を描きます。母は私の絵を壁に貼ります。彼女は私が良い画家だと言います。",
        "questions": [
            {"question": "What is the speaker's favorite book?", "questionJa": "話し手の好きな本は何ですか？", "options": ["Sherlock Holmes", "Harry Potter", "Alice in Wonderland", "Tom Sawyer"], "answer": 1},
            {"question": "What does the speaker draw?", "questionJa": "話し手は何を描きますか？", "options": ["People", "Cars", "Animals and flowers", "Buildings"], "answer": 2},
            {"question": "What does the mother do with the pictures?", "questionJa": "母は絵をどうしますか？", "options": ["Throws them away", "Puts them on the wall", "Gives them to friends", "Sells them"], "answer": 1}
        ]
    },
    {
        "id": "r005",
        "day": 8,
        "title": "Weekend Plans",
        "passage": "This Saturday, I'm going to the zoo with my family. We will see many animals like lions, elephants, and pandas. I'm very excited! On Sunday, I will visit my grandmother. She makes delicious cookies. I can't wait for the weekend!",
        "translation": "今週の土曜日、私は家族と動物園に行く予定です。ライオンや象、パンダなど、たくさんの動物を見ます。とても楽しみです！日曜日は、おばあちゃんを訪ねます。彼女はおいしいクッキーを作ります。週末が待ちきれません！",
        "questions": [
            {"question": "Where will they go on Saturday?", "questionJa": "土曜日にどこに行きますか？", "options": ["The park", "The zoo", "The beach", "The museum"], "answer": 1},
            {"question": "What animal is NOT mentioned?", "questionJa": "言及されていない動物は何ですか？", "options": ["Lion", "Elephant", "Tiger", "Panda"], "answer": 2},
            {"question": "Who makes delicious cookies?", "questionJa": "誰がおいしいクッキーを作りますか？", "options": ["Mother", "Father", "Grandmother", "Sister"], "answer": 2}
        ]
    }
]

with open('data/reading.json', 'w', encoding='utf-8') as f:
    json.dump(reading_all, f, ensure_ascii=False, indent=4)

print("[OK] reading.json updated: 5 passages total")
print("\n[OK] All listening and reading data updated!")
