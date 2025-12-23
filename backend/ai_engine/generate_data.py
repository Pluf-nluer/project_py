import pandas as pd
import numpy as np
import random


def create_structured_dataset():

    # 1. Giả lập 500 User và 100 Course
    n_users = 500
    n_courses = 100
    n_interactions = 5000  # 5000 dòng dữ liệu

    users = [f"User_{i}" for i in range(n_users)]
    courses = [f"Course_{i}" for i in range(n_courses)]

    # 2. Gán "Nhãn" (Category) ẩn cho Course
    # Ví dụ: Course_0 đến Course_19 là Python, Course_20 đến 39 là Web...
    categories = ['Python', 'Web', 'Data', 'Design', 'Marketing']
    course_cats = {}
    for c in courses:
        course_cats[c] = random.choice(categories)

    # 3. Gán "Sở thích" (Preference) ẩn cho User
    # Mỗi user sẽ thích một thể loại nhất định
    user_prefs = {}
    for u in users:
        user_prefs[u] = random.choice(categories)

    data = []

    # 4. Sinh dữ liệu dựa trên QUY LUẬT (Model sẽ phải học cái quy luật này)
    for _ in range(n_interactions):
        u = random.choice(users)
        c = random.choice(courses)

        u_pref = user_prefs[u]
        c_cat = course_cats[c]

        # LOGIC: Nếu User thích thể loại này -> Rate cao. Không thì Rate thấp.
        if u_pref == c_cat:
            # 80% là rate 4-5, 20% là rate 3
            rating = np.random.choice([3, 4, 5], p=[0.1, 0.4, 0.5])
        else:
            # 80% là rate 1-2, 20% là rate 3
            rating = np.random.choice([1, 2, 3], p=[0.5, 0.3, 0.2])

        data.append([u, c, rating])

    # Lưu ra file CSV
    df = pd.DataFrame(data, columns=['user_id', 'course_id', 'rating'])
    df = df.drop_duplicates(subset=['user_id', 'course_id'])

    filename = "training_dataset.csv"
    df.to_csv(filename, index=False)
    print(f"✅ Đã tạo dataset: '{filename}' ({len(df)} dòng).")
    print("👉 Dataset này chứa quy luật ẩn: User thích Category nào sẽ rate cao Category đó.")


if __name__ == "__main__":
    create_structured_dataset()