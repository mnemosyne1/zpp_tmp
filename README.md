# Dialog-Based Search Engine for E-Commerce
This repository contains all the files you need to run our system.

Module fetcher (fetching data) is implemented in [API Client](api_client) and [embedder]((chat_embedder/embed_dataset.py)) in [chat_embedder](chat_embedder/embed_dataset.py).

To load the data to database you need to first set it up according to [instructions](products), then use [the script for loading the data](chat_embedder/load_database.py).

To run module chat follow the instructions from [chat_embedder](chat_embedder).

To run module front follow the instructions from [front](front).