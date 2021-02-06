## roBrowser Electron Wrapper

This is an wrapper for [roBrowser](www.robrowser.com) written using [Electron](www.electronjs.org). It allows you to run roBrowser as an executable file.

This app uses the [roBrowser forked version as client](https://github.com/wjrosa/Ragna.roBrowser).

### Setup

1 - Create your environment variables file (.env) by copying the .env.example.

2 - Install the dependencies:

````shell script
$ yarn install
````
3 - Download roBrowser and put it inside /robrowser folder.

4 - Run the app:
````shell script
$ yarn start
````

### Build

To create the bin file just run the command below:
````shell script
$ yarn make
````

### Customizing

#### Change the bin icon

Include `icon.ico` and `icon.png` inside /images folder (128x128).
