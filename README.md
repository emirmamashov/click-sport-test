# ClickSport

## Установка

1. Установите зависимости для каждой части проекта:
   - В папке `/database`:
     ```bash
     npm install
     ```
   - В папке `/api`:
     ```bash
     npm install
     ```
   - В папке `/web`:
     ```bash
     npm install
     ```

2. Установите базы данных MongoDB v5:
```bash
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
  3.3)echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
```
```bash
  apt-get install -y mongodb-org
```

## Запуск Backend

Перейдите в папку `/api` и выполните:

```bash
npm start
```

## Запуск Frontend

Перейдите в папку `/web` и выполните:

```bash
npm start
```