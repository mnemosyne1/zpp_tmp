# Użytkowanie na lokalnej maszynie

# Embedder

```bash
mkdir json_files
```

Wrzuć do utworzonego folderu plik `data.json`.
Potem przekonwertuj dane dodając do nich embedding.
Skrypt ten tworzy odpowiedni folder, jeśli jeszcze go nie ma.
Uwaga! Program ten generuje też streszczenia opisów porduktów zawartych w bazie, co trwa bardzo długo, nawet kilka dni dla obecnej bazy danych.  
Można je pominąć - sprawdź plik.

```bash
python3 embed_dataset.py
```

Po postawieniu bazy products można załadować dane do bazy, jeśli się nie powiedzie, zostanie zatrzymane. Jest to długi proces, dla obecnych danych u mnie działało koło 17 minut.

```bash
python3 load_database.py
```

# Chat

## Pobranie niezbędnych bibliotek i modelu językowego

Zacznij od pobrania aplikacji ollama na swój komputer.

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Następnie zainstaluj model językowy, którego użyjemy w naszym RAGu.

```bash
ollama run llama3.1
```

Na koniec potrzeba zainstalować biblioteki pythona, z których będziemy korzystać.

```bash
pip install -r requirements.txt
```

Możliwe, że będą też potrzebne inne biblioteki, ale to wyjdzie przy próbie uruchomienia.
Na pewno zainstaluj dockera - stawiamy vespę przez dockera.
Chyba, że umiesz to zrobić bez, a w dodatku w działający sposób - up to you.


## Użytkowanie chatbota

Jeśli nasza baza danych będzie działać, bot w wersji demo powinien być gotowy!

```bash
python3 main.py
```

Do wykorzystania w systemie (jako moduł chat) należy uruchomić aplikację wykonując
```bash
python3 app.py
```
Uruchomi to FastAPI na localhost:5000

Uwaga: czas odpowiedzi chatbota może być długi, jeśli masz słaby sprzęt. Na moim laptopie generowanie odpowiedzi trwało około 2 minut. Najlepiej, gdy się ma dedykowaną kartę graficzną.
Wtedy odpowiedzi powinny być szybsze.  

Uwaga2: Wysłanie zapytania przez bota od razu po uruchomieniu bazy danych może spowodować błąd. Warto odczekać 10 - 15 sekund z pierwszym pytaniem po załadowaniu bazy.

