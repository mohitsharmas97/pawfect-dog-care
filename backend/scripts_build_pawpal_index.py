from app.pawpal_rag import build_index
if __name__ == '__main__':
    count = build_index()
    print(f'PawPal knowledge index created with {count} chunks.')
