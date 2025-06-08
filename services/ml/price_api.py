from flask import Flask, request, jsonify
from joblib import load
from sklearn.ensemble import RandomForestRegressor
import numpy as np
import os

app = Flask(__name__)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "price_model.joblib")

model = load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Example: expects keys 'level', 'damage', 'HP_points', 'mana_points', 'time_on_market'
    features = np.array([[data['level'], data['damage'], data['HP_points'], data['mana_points'], data['sold'], data['time_on_market']]])
    price = model.predict(features)[0]
    return jsonify({'predicted_price': int(price)})

if __name__ == '__main__':
    app.run(port=5001)