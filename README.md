# concepts
Web scraper use to build a database of terms and lexical field



# Install

## Create Database

Create a database on local postgres

``` 
sudo su postgres
psql
```

```sql
CREATE USER "concepts" WITH PASSWORD 'abcdefgh';
CREATE DATABASE "concepts" WITH OWNER concepts;
```


