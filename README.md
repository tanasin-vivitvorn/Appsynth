# URL Shortener
run following command to create server.crt and server.key
```
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

run following command to install required packages
```
npm install
```

Install mongodb (Mac OS)
```
brew install mongodb
```

Start mongodb
```
sudo /usr/local/bin/mongod
```

Start app (requires sudo incase start on port 443 )
```
sudo node app
```

Open browser and navigate to https://localhost

put your original URL to be shorten and press "Shorten!"

enjoy!
