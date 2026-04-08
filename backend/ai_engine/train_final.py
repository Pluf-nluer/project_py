# train_final.py
def train_model():
    # 1. Chỉ lấy dữ liệu từ kết quả làm bài để đảm bảo tính chuyên môn
    interactions = UserInteraction.objects.filter(interaction_type='QUIZ').values('user_id', 'course_id', 'rating')

    df = pd.DataFrame(list(interactions))
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['user_id', 'course_id', 'rating']], reader)

    # 2. Tìm tham số tốt nhất (Grid Search)
    param_grid = {'n_factors': [20, 50, 100], 'n_epochs': [20, 30], 'lr_all': [0.005, 0.01]}
    gs = GridSearchCV(SVD, param_grid, measures=['rmse'], cv=5)
    gs.fit(data)

    # 3. Huấn luyện với bộ tham số tối ưu nhất
    algo = gs.best_estimator['rmse']
    trainset = data.build_full_trainset()
    algo.fit(trainset)

    # 4. Lưu kết quả đánh giá để báo cáo
    rmse_score = gs.best_score['rmse']
    print(f"🚀 Model Trained! Best RMSE: {rmse_score:.4f}")

    # Lưu model kèm theo metadata
    joblib.dump({'model': algo, 'rmse': rmse_score}, 'nlu_recommendation_model.pkl')