from dotenv import load_dotenv
import os
import pymysql
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from joblib import dump


load_dotenv()

# file to store data so that i do not run the select every time
CACHE_FILE = "services/ml/shop_data.csv"

connection = pymysql.connect(
    host = os.environ['DB_HOST'],
    user = os.environ['DB_USER'],
    password = os.environ['DB_PASSWORD'],
    db = os.environ['DB_NAME']
)

if os.path.exists(CACHE_FILE):
    df = pd.read_csv(CACHE_FILE)
    last_id = df['shop_id'].max()
    query = f"""
    SELECT s.shop_id, s.price_listed, s.sold, s.date_listed, s.date_sold, s.seller_id,
           c.level, c.damage, c.HP_points, c.mana_points, c.card_id
    FROM Shop s
    JOIN Card c ON s.card_id = c.card_id
    WHERE s.shop_id > '{last_id}'
    ORDER BY s.shop_id;
    """

    new_data = pd.read_sql(query, connection)
    if not new_data.empty:
        df = pd.concat([df, new_data], ignore_index=True)
        print(f"Appended {len(new_data)} new rows.")
    else:
        print("No new data found.")

    # Find rows that might have changed (e.g., sold status updated)
    # We'll check all rows with sold = 0 in the CSV

    unsold_cards = df[df['sold'] == 0]['shop_id'].tolist()
    if unsold_cards:
        format_ids = ','.join(map(str, unsold_cards))
        query_update = f"""
        SELECT s.shop_id, s.sold, s.date_sold
        FROM Shop s
        WHERE s.shop_id IN ({format_ids})
        """
        updated_rows = pd.read_sql(query_update, connection)
        for _, row in updated_rows.iterrows():
            df.loc[df['shop_id'] == row['shop_id'], 'sold'] = row['sold']
            df.loc[df['shop_id'] == row['shop_id'], 'date_sold'] = row['date_sold']
        print(f"Updated {len(updated_rows)} rows with new sold status.")
    df.to_csv(CACHE_FILE, index=False)    

else:
    query = """
    SELECT s.shop_id, s.price_listed, s.sold, s.date_listed, s.date_sold, s.seller_id,
           c.level, c.damage, c.HP_points, c.mana_points, c.card_id
    FROM Shop s
    JOIN Card c ON s.card_id = c.card_id
    ORDER BY s.shop_id;
    """
    df = pd.read_sql(query, connection)
    df.to_csv(CACHE_FILE, index=False)
    print("Initial data cached.")


# Convert to datetime
df['date_listed'] = pd.to_datetime(df['date_listed'])
df['date_sold'] = pd.to_datetime(df['date_sold'], errors = 'coerce')

# get current timestamp
now = pd.Timestamp(datetime.now())

# Compute time_on_market
df['time_on_market'] = np.where(
    df['date_sold'].notna(),
    (df['date_sold'] - df['date_listed']).dt.days,
    (now - df['date_listed']).dt.days
)

# Drop rows with missing values
df = df.dropna()

# create feature and prediction arrays 
features = ['level', 'damage', 'HP_points', 'mana_points', 'sold', 'time_on_market']  
X = df[features]
y = df['price_listed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2)
model = RandomForestRegressor()
model.fit(X_train, y_train)

print("Test R^2 score:", model.score(X_test, y_test))

# print(df.tail())

# save model 
dump(model, "services/ml/price_model.joblib")