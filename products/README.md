# Użytkowanie na lokalnej maszynie

## Przygotowanie bazy danych

W pliku `docker-compose.yml` w części `volumes` są podane trzy ścieżki, są to mapowania dla folderów bazy na naszej maszynie lokalnej. Można je zmieniać (w sensie części przed znakiem `:`), jednak:

- do mapowania dla `/opt/vespa/conf/vespa-schemas` trzeba wrzucić plik `items.sd`
- do mapowania dla `/opt/vespa/conf/vespa-app` trzeba wrzucić pliki `hosts.xml` i `services.xml`.

Przy zmianach mapowań trzeba uważać, u mnie był problem ze ścieżkami używającymi katalogu domyślnego (czyli z `~`).

Uwaga: Żeby załadować dane do bazy być może potrzebne będzie uruchomienie Dockera (patrz punkt niżej).

Uwaga2: Bazy danych nie trzeba ładować za każdym uruchomieniem jej lub Dockera. Raz załadowane dane zostają przechowywane.

## Uruchamianie bazy danych i dockera

Aby uruchomić `Dockera` wejdź do folderu vespa i zrób:

```bash
docker-compose up -d
```

Następnie aby uruchomić bazę danych wywołaj:

```bash
docker exec vespa bash -c '/opt/vespa/bin/vespa-deploy prepare /opt/vespa/conf/vespa-app && /opt/vespa/bin/vespa-deploy activate'
```

Uwaga: Docker potrzebuje trochę czasu (koło 10 - 15 sekund), żeby się załadować, więc uruchamianie bazy od razu może spowodować błąd.

Wyłączanie `Dockera`:

```bash
docker-compose down
```
