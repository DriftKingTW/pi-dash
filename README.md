# pi-dash

The dashboard runs in Chromium kiosk mode on a Raspberry Pi, on a 1480x320
panel. `HomeView` lays three blocks across it; anything needing an API key or a
way around CORS goes through pi-dash-server rather than being called from here.

## Claude Code usage

The middle block shows Claude Code subscription limits and spend. The figures
only exist on a Mac - they are scraped from what Claude Code hands its status
line - so they arrive via `GET /claude` on pi-dash-server, which proxies a
bridge running on that Mac and caches the last reading for when it is asleep.

That means the block has to say when it is showing something old rather than
something current. `ControlCenter.vue` adds the payload's own `age` to the
server's `bridge.cachedSeconds` and, past 15 minutes, fades the whole block and
labels it with its age. Past 5 minutes the mascot closes its eyes.

The full picture, including why the data cannot live on the Pi, is in
pi-dash-server's README under "Claude Code 用量".

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
