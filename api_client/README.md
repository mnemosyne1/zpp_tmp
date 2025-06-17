# General instruction
- prepare enviroment to satisfy requirements (from `requirements.txt`)
- create `ebay-config.yaml` basing on `ebay-config-sample.yaml`
- `python3 main.py`
- this will edit or create file `data.json` stored in main directory
- in order to embed the data and insert it to the database, use `embed_dataset.py` and `load_dataset.py` from the `chat_embedder` module
# Credits
`ebay_oauth` module was [created by ebay](https://github.com/eBay/ebay-oauth-python-client/), then developed by user roth_a [in this pull request](https://github.com/eBay/ebay-oauth-python-client/pull/6). I used that edition with a few minor changes.