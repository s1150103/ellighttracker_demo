from google.cloud import datastore

datastore_client = datastore.Client(project="crud2-171605")

def fetch_all_data():
    query = datastore_client.query(kind="ChatHistory")
    results = list(query.fetch())

    if not results:
        print("データがありません")
    else:
        for entity in results:
            print(f"質問: {entity.get('question')}")
            print(f"回答: {entity.get('response')}")
            print(f"タイムスタンプ: {entity.get('timestamp')}\n")

fetch_all_data()

